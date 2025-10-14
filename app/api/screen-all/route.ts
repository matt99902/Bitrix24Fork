// app/api/screen-all/route.ts

import { auth } from "@/auth";               
import { pubSubClient } from "@/lib/pubsub-client"; 
import { NextResponse } from "next/server";
import { redisClient } from "@/lib/redis";    

// Name of the Pub/Sub topic to which screening jobs will be published
// Must be defined in environment variables.
const topicName = process.env.PUBSUB_TOPIC_NAME;

/**
 * POST /api/screen-all
 * -------------------------------------------------------------------------
 * Queues multiple deals for automated screening.
 *
 * High-level flow:
 *  1. Authenticate user via session.
 *  2. Validate incoming payload (deals + screener info).
 *  3. Publish each deal as a Pub/Sub message.
 *  4. Create initial job entries in Redis for tracking.
 *  5. Return success once all messages are queued.
 *
 * This endpoint is typically triggered when a user
 * clicks “Screen All Deals” in the UI.
 * -------------------------------------------------------------------------
 */
export async function POST(request: Request) {
  // Step 1: Authenticate user
  // -----------------------------------------------------------------------
  // The auth helper should provide a session object with `user.id`.
  const userSession = await auth();
  if (!userSession?.user?.id) {
    return NextResponse.json(
      { message: "Unauthorized - missing user id" },
      { status: 401 }
    );
  }

  const userId = userSession.user.id;

  // Ensure topic name is available
  if (!topicName) {
    console.error("❌ PUBSUB_TOPIC_NAME not configured in environment variables.");
    return NextResponse.json(
      { message: "Server misconfiguration: missing Pub/Sub topic" },
      { status: 500 }
    );
  }

  // Step 2: Parse and validate request body
  // -----------------------------------------------------------------------
  // The frontend should send an object like:
  // {
  //   dealListings: [ { title: "...", url: "...", ... }, ... ],
  //   screenerId: "abc123",
  //   screenerContent: "...",
  //   screenerName: "Quick Filter"
  // }
  const { dealListings, screenerId, screenerContent, screenerName } =
    await request.json();

  // Validate deal listings
  if (!dealListings || !Array.isArray(dealListings) || dealListings.length === 0) {
    return NextResponse.json(
      { message: "Invalid deal listings" },
      { status: 400 }
    );
  }

  // Validate screener metadata
  if (!screenerId || !screenerContent || !screenerName) {
    console.log("❌ Screener information missing in screen-all request");
    return NextResponse.json({ message: "Invalid screener" }, { status: 400 });
  }

  try {
    // Step 3: Prepare asynchronous operations
    // -----------------------------------------------------------------------
    // We'll collect all Pub/Sub publish and Redis writes into arrays
    // so they can be executed concurrently with Promise.all().
    const publishPromises: Promise<string>[] = [];
    const redisPromises: Promise<unknown>[] = [];

    // Iterate through all deals and queue each one
    for (const dealListing of dealListings) {
      const jobId = crypto.randomUUID(); // Unique ID for tracking this job
      const timestamp = Date.now();

      // Construct the message payload that workers will consume
      const payload = {
        ...dealListing,    // Deal-specific data (e.g., title, URL, etc.)
        userId,            // Identify which user owns this job
        screenerId,        // Screener configuration being used
        screenerContent,
        screenerName,
        jobId,             // Used to correlate with Redis state
      };

      // Convert to binary data (Pub/Sub requires this)
      const dataBuffer = Buffer.from(JSON.stringify(payload));

      // Step 3A: Publish to Pub/Sub
      // -------------------------------------------------------------------
      // The message will be picked up by a Cloud Function or worker that
      // performs the screening process asynchronously.
      const publishPromise = pubSubClient
        .topic(topicName)
        .publishMessage({
          data: dataBuffer,
          attributes: { jobType: "screenAll" }, // optional metadata for filtering
        });
      publishPromises.push(publishPromise);

      // Step 3B: Initialize job state in Redis
      // -------------------------------------------------------------------
      // Redis stores a hash for each job with initial metadata.
      const redisKey = `deal:${jobId}`;
      const redisPromise = redisClient.hset(redisKey, {
        userId,
        title: dealListing.title ?? "Untitled Deal",
        status: "Pending", // Worker updates this to “Success” or “Failed”
        result: "N/A",
        timestamp,
      });
      redisPromises.push(redisPromise);

      // Step 3C: Add job ID to the user’s job list for easy lookup
      const lpushPromise = redisClient.lpush(`user:${userId}:jobs`, jobId);
      redisPromises.push(lpushPromise);
    }

    // Step 4: Execute all async tasks concurrently
    // -----------------------------------------------------------------------
    // Using Promise.all() ensures the function waits until *all*
    // messages are published and Redis states are initialized.
    await Promise.all([...publishPromises, ...redisPromises]);

    console.log(
      `✅ User ${userId}: published ${dealListings.length} deals and initialized Redis successfully`
    );

    // Step 5: Respond to frontend
    // -----------------------------------------------------------------------
    // The frontend can now start polling for updates via `/api/notifications`
    // or Redis-backed websocket/SSE for progress updates.
    return NextResponse.json({
      message: "Jobs queued successfully",
      totalQueued: dealListings.length,
    });
  } catch (error) {
    // Step 6: Error handling
    // -----------------------------------------------------------------------
    console.error("❌ Error publishing deals to Pub/Sub / Redis:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
