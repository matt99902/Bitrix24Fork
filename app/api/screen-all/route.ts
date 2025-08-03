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
        status: 400,
      },
    );
  }

  const { dealListings } = await request.json();
  console.log("inside api route");
  console.log(dealListings);

  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error("Error connecting to Redis:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }

  try {
    dealListings.forEach(async (dealListing: any) => {
      const dealListingWithUserId = {
        ...dealListing,
        userId: userSession.user.id,
      };

      await redisClient.lPush(
        "dealListings",
        JSON.stringify(dealListingWithUserId),
      );
    });
  } catch (error) {
    console.error("Error pushing to Redis:", error);
    return NextResponse.json({ message: "Error pushing to Redis" });
  }

  return NextResponse.json({
    message: "Products successfully pushed on to the backend",
  });
}
