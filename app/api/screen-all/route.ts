import { auth } from "@/auth";
import { redisClient } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const userSession = await auth();

  if (!userSession) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const { dealListings, screenerId, screenerContent, screenerName } =
    await request.json();

  if (
    !dealListings ||
    !Array.isArray(dealListings) ||
    dealListings.length === 0
  ) {
    return NextResponse.json(
      { message: "Invalid deal listings" },
      { status: 400 },
    );
  }

  if (!screenerId || !screenerContent || !screenerName) {
    console.log(
      "screener information is not present inside screen all function",
    );

    return NextResponse.json({ message: "Invalid screener" }, { status: 400 });
  }

  try {
    // Enqueue each deal (await to ensure completion before publish)
    for (const dealListing of dealListings) {
      const payload = {
        ...dealListing,
        userId: userSession.user.id,
        screenerId,
        screenerContent,
        screenerName,
      };
      await redisClient.rpush("dealListings", JSON.stringify(payload));
    }

    // Notify via pub/sub that new items are available for this user
    await redisClient.publish(
      "new_screen_call",
      JSON.stringify({ userId: userSession.user.id }),
    );

    return NextResponse.json({ message: "Enqueued" });
  } catch (error) {
    console.error("Error enqueuing deals:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
