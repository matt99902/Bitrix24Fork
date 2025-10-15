// app/api/notifications/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma"; 

/**
 * Handles GET requests to `/api/notifications`
 * ------------------------------------------------------------
 * This route is used by the frontend to fetch the most recent
 * notifications for the currently authenticated user.
 * 
 * Workflow:
 *   1. Verify user session using `auth()`
 *   2. Fetch the latest 100 notifications from the database
 *      belonging to that user (via Prisma)
 *   3. Shape and sanitize the data before returning JSON
 * 
 * This route is *read-only* and does not modify any data.
 * It is called frequently (e.g., on app load or via SSE/websocket refresh),
 * so it should remain lightweight and performant.
 */
export async function GET(req: Request) {
  // Step 1: Validate the current session
  // ------------------------------------------------------------
  // The `auth()` helper should return the current session object
  // or `null` if no user is logged in.
  // We rely on the `session.user.id` field to scope the DB query.
  const session = await auth();
  if (!session?.user?.id) {
    // If no valid session is found, return 401 Unauthorized.
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "User not logged in" } },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  try {
    // Step 2: Query the database for notifications
    // ------------------------------------------------------------
    // Fetch up to the 100 most recent notifications belonging
    // to the current user. We explicitly `select` only fields
    // needed by the frontend to minimize payload size.
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, type: true, data: true, createdAt: true },
    });

    // Step 3: Transform raw database rows into frontend shape
    // ------------------------------------------------------------
    // Each notification record contains:
    //   - id: unique identifier
    //   - type: notification type (e.g., "DEAL_APPROVED")
    //   - data: JSON payload with optional metadata
    //   - createdAt: timestamp
    //
    // The `data` field may contain arbitrary JSON, so we perform
    // a safe type check before destructuring.
    const screeners = notifications.map((n) => {
      const data =
        typeof n.data === "object" && n.data !== null ? (n.data as any) : {};

      return {
        id: n.id,
        // Use `data.title` if present, otherwise fall back to the
        // notification type. This keeps the UI resilient to missing data.
        title: data.title ?? n.type,
        // Use `data.status` if available, otherwise default to "Pending".
        status: data.status ?? "Pending",
        // Convert Date → ISO string to avoid timezone discrepancies
        createdAt: n.createdAt.toISOString(),
      };
    });

    // Step 4: Return notifications as JSON
    // ------------------------------------------------------------
    // `no-store` disables any form of caching, which ensures users
    // always see the most up-to-date notifications in a real-time system.
    return NextResponse.json(screeners, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err: any) {
    // Step 5: Error handling
    // ------------------------------------------------------------
    // If Prisma fails (e.g., DB unavailable or schema mismatch),
    // we log a structured error for Cloud Logging / Stackdriver.
    console.error(
      JSON.stringify({
        severity: "ERROR",
        message: "Failed to fetch notifications",
        error: err.message,
      })
    );

    // Return a generic error message to the client.
    // Avoid exposing internal Prisma error details.
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Internal Server Error" } },
      { status: 500 }
    );
  }
}
