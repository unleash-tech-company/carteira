import { clerkClient, auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const clerkClientInstance = await clerkClient();
    const sessionsResponse = await clerkClientInstance.sessions.getSessionList({
      userId,
      status: "active",
    });
    
    // Ensure we return an array of sessions with consistent structure
    return NextResponse.json({
      sessions: sessionsResponse.data.map(session => ({
        id: session.id,
        lastActiveAt: session.lastActiveAt,
        createdAt: session.createdAt
      }))
    });
  } catch (error) {
    console.error("[Sessions API] Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions", sessions: [] }, 
      { status: 500 }
    );
  }
} 