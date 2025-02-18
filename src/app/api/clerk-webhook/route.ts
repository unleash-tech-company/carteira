import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { getPusherInstance } from "@/lib/pusher";
import { env } from "@/env";
import { clerkClient } from "@clerk/nextjs/server";
import type { Session } from "@clerk/nextjs/server";
import logger from "@/lib/logger";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    logger.error("Missing CLERK_WEBHOOK_SECRET in environment");
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env");
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    logger.warn("Missing Svix headers in webhook request");
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
    logger.error({ err }, "Error verifying webhook signature");
    return new Response("Error occured", {
      status: 400,
    });
  }

  const eventType = evt.type;
  const sessionData = evt.data as { userId?: string; id: string };
  const userId = sessionData.userId;
  const sessionId = sessionData.id;

  if (!userId) {
    logger.warn({ sessionData }, "Missing user ID in webhook payload");
    return new Response("Missing user ID", { status: 400 });
  }

  const pusher = getPusherInstance();

  try {
    switch (eventType) {
      case "session.created": {
        logger.info({ userId, sessionId }, "New session created");
        const clerk = await clerkClient();
        const sessionsResponse = await clerk.sessions.getSessionList({
          userId,
          status: "active",
        });

        const sessions = sessionsResponse.data;

        if (sessions.length > 1) {
          const sortedSessions = [...sessions].sort(
            (a: Session, b: Session) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          const excessSessionIds = sortedSessions
            .slice(1)
            .map((session: Session) => session.id);

          logger.info(
            { userId, excessSessionIds },
            "Revoking excess sessions"
          );

          await Promise.all(
            excessSessionIds.map(async (id: string) => {
              const clerk = await clerkClient();
              return clerk.sessions.revokeSession(id);
            })
          );

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
        logger.info(
          { userId, sessionId, eventType },
          "Session state changed"
        );
        await pusher.trigger("private-session", `evt::session-${userId}`, {
          type: "session-ended",
          data: {
            sessionId,
            message: `Session ${eventType.replace('session.', '')}`,
          },
        });
        break;

      default:
        logger.debug({ eventType }, "Unhandled webhook event");
    }
  } catch (error) {
    logger.error(
      { error, userId, sessionId, eventType },
      "Error processing webhook"
    );
    return new Response("Error processing webhook", { status: 500 });
  }

  return new Response("", { status: 200 });
} 