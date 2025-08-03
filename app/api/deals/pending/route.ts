import { auth } from "@/auth";
import { redisClient } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET() {
  const userSession = await auth();

  if (!userSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ensure connected
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error("Error connecting to Redis:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  try {
    const raw = await redisClient.lRange("dealListings", 0, -1);

    // parse and filter by this user
    const all = raw
      .map((s) => {
        try {
          return JSON.parse(s);
        } catch {
          return null;
        }
      })
      .filter((d) => d && d.userId === userSession.user.id);

    // map to shape: { id, productName, status: "Pending" }
    const pending = all.map(({ id, title, ebitda }) => ({
      id,
      title: title,
      ebitda: ebitda,
      status: "Pending",
    }));

    console.log("pending", pending);

    return NextResponse.json(pending);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
