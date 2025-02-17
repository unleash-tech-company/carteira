import { getPusherInstance } from "@/lib/pusher";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId, sessionId } = await auth();

  if (!userId || !sessionId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Verify if the session is still active
    const clerk = await clerkClient();
    const session = await clerk.sessions.getSession(sessionId);
    if (!session || session.status !== "active") {
      return new Response("Session invalid", { status: 401 });
    }

    const data = await req.text();
    const [socket_id, channel_name] = data
      .split("&")
      .map((str) => str.split("=")[1]);

    if (!socket_id || !channel_name) {
      return new Response("Invalid request", { status: 400 });
    }

    // Validate that the channel is for this user
    if (!channel_name.includes(`private-session`)) {
      return new Response("Invalid channel", { status: 403 });
    }

    const pusherServer = getPusherInstance();
    const authResponse = pusherServer.authorizeChannel(socket_id, channel_name);
    
    return new Response(JSON.stringify(authResponse));
  } catch (error) {
    console.error("Error in Pusher auth:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
} 