import { getPusherInstance } from "@/lib/pusher";
import { auth } from "@clerk/nextjs/server";


export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const data = await req.text();
    const [socket_id, channel_name] = data
      .split("&")
      .map((str) => str.split("=")[1]);

    if (!socket_id || !channel_name) {
      return new Response("Invalid request", { status: 400 });
    }

    const pusherServer = getPusherInstance();
    const auth = pusherServer.authorizeChannel(socket_id, channel_name);
    
    return new Response(JSON.stringify(auth));
  } catch (error) {
    console.error("Error in Pusher auth:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
} 