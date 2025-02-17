import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { getPusherInstance } from "@/lib/pusher";
import { env } from "@/env";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env");
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  const eventType = evt.type;
  const userId = evt.data.id;

  if (eventType === "session.created") {
    const pusher = getPusherInstance();
    await pusher.trigger(`user-${userId}`, "session-created", {
      message: "New session created",
      sessionId: evt.data.id,
    });
  }

  if (eventType === "session.removed") {
    const pusher = getPusherInstance();
    await pusher.trigger(`user-${userId}`, "session-removed", {
      message: "Session ended",
      sessionId: evt.data.id,
    });
  }

  return new Response("", { status: 200 });
} 