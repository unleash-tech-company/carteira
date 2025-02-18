import { clerkClient, auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import logger from "@/lib/logger";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    logger.warn("Unauthorized access attempt to sessions API");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const clerkClientInstance = await clerkClient();
    const sessionsResponse = await clerkClientInstance.sessions.getSessionList({
      userId,
      status: "active",
    });
    
    logger.info({ userId }, "Successfully fetched user sessions");
    return NextResponse.json({
      sessions: sessionsResponse.data.map(session => ({
        id: session.id,
        lastActiveAt: session.lastActiveAt,
        createdAt: session.createdAt
      }))
    });
  } catch (error) {
    logger.error({ error, userId }, "Error fetching sessions");
    return NextResponse.json(
      { error: "Failed to fetch sessions", sessions: [] }, 
      { status: 500 }
    );
  }
} 