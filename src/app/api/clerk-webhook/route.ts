import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { getPusherInstance } from "@/lib/pusher";
import { env } from "@/env";
import { clerkClient } from "@clerk/nextjs/server";
import type { Session } from "@clerk/nextjs/server";

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
  const sessionData = evt.data as { userId?: string; id: string };
  const userId = sessionData.userId;
  const sessionId = sessionData.id;

  if (!userId) {
    return new Response("Missing user ID", { status: 400 });
  }

  const pusher = getPusherInstance();

  try {
    switch (eventType) {
      case "session.created": {
        // Get all active sessions for the user
        const clerk = await clerkClient();
        const sessionsResponse = await clerk.sessions.getSessionList({
          userId,
          status: "active",
        });

        const sessions = sessionsResponse.data;

        // If there's more than one session, end all but the newest one
        if (sessions.length > 1) {
          // Sort sessions by creation date, newest first
          const sortedSessions = [...sessions].sort(
            (a: Session, b: Session) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          // Get all session IDs except the newest one
          const excessSessionIds = sortedSessions
            .slice(1)
            .map((session: Session) => session.id);

          // End excess sessions
          await Promise.all(
            excessSessionIds.map(async (id: string) => {
              const clerk = await clerkClient();
              return clerk.sessions.revokeSession(id);
            })
          );

          // Notify clients about the session revocation
          await pusher.trigger("private-session", `evt::session-${userId}`, {
            type: "session-ended",
            data: {
              sessionId,
              message: "Multiple sessions detected",
            },
          });
        }
        break;
      }

      case "session.ended":
      case "session.removed":
      case "session.revoked":
        await pusher.trigger("private-session", `evt::session-${userId}`, {
          type: "session-ended",
          data: {
            sessionId,
            message: `Session ${eventType.replace('session.', '')}`,
          },
        });
        break;

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Error processing webhook", { status: 500 });
  }

  return new Response("", { status: 200 });
} 