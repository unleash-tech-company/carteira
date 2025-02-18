import { getPusherInstance } from "@/lib/pusher";
import { auth, clerkClient } from "@clerk/nextjs/server";
import logger from "@/lib/logger";

export async function POST(req: Request) {
  const { sessionId } = await auth();

  if (!sessionId) {
    logger.warn("Unauthorized access attempt to Pusher auth");
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Verify if the session is still active
    const clerk = await clerkClient();
    const session = await clerk.sessions.getSession(sessionId);
    if (!session || session.status !== "active") {
      logger.warn({ sessionId }, "Invalid session in Pusher auth");
      return new Response("Session invalid", { status: 401 });
    }

    const data = await req.text();
    const [socket_id, channel_name] = data
      .split("&")
      .map((str) => str.split("=")[1]);

    if (!socket_id || !channel_name) {
      logger.warn({ socket_id, channel_name }, "Invalid Pusher auth request");
      return new Response("Invalid request", { status: 400 });
    }

    // Validate that the channel is for this user
    if (!channel_name.includes(`private-session`)) {
      logger.warn({ channel_name }, "Invalid channel requested");
      return new Response("Invalid channel", { status: 403 });
    }

    const pusherServer = getPusherInstance();
    const authResponse = pusherServer.authorizeChannel(socket_id, channel_name);
    
    logger.info({ sessionId, channel_name }, "Successfully authorized Pusher channel");
    return new Response(JSON.stringify(authResponse));
  } catch (error) {
    logger.error({ error, sessionId }, "Error in Pusher auth");
    return new Response("Internal Server Error", { status: 500 });
  }
} 