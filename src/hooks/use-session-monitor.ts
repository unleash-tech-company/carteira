import { useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { getPusherClientInstance } from "@/lib/pusher-client";
import { useRouter } from "next/navigation";
import PusherClient from "pusher-js";
import type { Channel } from "pusher-js";

const useHandleSignOut = () => {
  const { signOut } = useClerk();
  const router = useRouter();

  return async (currentSessionId: string) => {
    await signOut(() => {
      router.push(`/sign-in?forcedRedirect=true`);
    }, {
      sessionId: currentSessionId
    });
  };
};

const useHandleSessionRemoval = () => {
  const { session: currentSession } = useClerk();
  const handleSignOut = useHandleSignOut();

  return async (excessSessionIds: string[]) => {
    try {
      const hasExcess = excessSessionIds.length > 0;
      const isCurrentSessionExcess =
        hasExcess && currentSession && excessSessionIds.includes(currentSession.id);

      if (!isCurrentSessionExcess) return;

      await handleSignOut(currentSession.id);
    } catch (error) {
      console.error('Error removing session:', error);
    }
  };
};

let didInit = false;

export function useSessionMonitor() {
  const { user } = useUser();
  const handleSessionRemoval = useHandleSessionRemoval();

  useEffect(() => {
    if (!didInit && user) {
      let pusher: PusherClient | null = null;
      let channel: Channel | null = null;

      try {
        pusher = getPusherClientInstance();
        channel = pusher
          .subscribe("private-session")
          .bind(
            `evt::revoke-${user.id}`,
            (data: { type: string; data: string[] }) => {
              if (data.type === "session-revoked") {
                handleSessionRemoval(data.data);
              }
            },
          );

        pusher.connection.bind("error", (error: any) => {
          console.error("Pusher connection error:", error);
          // Attempt to reconnect after error
          if (pusher) {
            pusher.connect();
          }
        });

        didInit = true;
      } catch (error) {
        console.error("Error initializing Pusher:", error);
        // Cleanup on error
        if (channel) {
          channel.unbind_all();
        }
        if (pusher) {
          pusher.unsubscribe("private-session");
        }
        didInit = false;
      }

      return () => {
        if (channel) {
          channel.unbind_all();
        }
        if (pusher) {
          pusher.unsubscribe("private-session");
          pusher.disconnect();
        }
        didInit = false;
      };
    }
  }, [user, handleSessionRemoval]);
} 