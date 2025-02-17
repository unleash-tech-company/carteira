import { useEffect, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { getPusherClientInstance } from "@/lib/pusher-client";
import { useRouter } from "next/navigation";
import PusherClient from "pusher-js";
import type { Channel } from "pusher-js";

const useHandleSignOut = () => {
  const { signOut } = useClerk();
  const router = useRouter();

  return async (currentSessionId: string) => {
    try {
      await signOut(() => {
        router.push(`/sign-in?forcedRedirect=true`);
      }, {
        sessionId: currentSessionId
      });
    } catch (error) {
      console.error('Error signing out:', error);
      router.push(`/sign-in?forcedRedirect=true`);
    }
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

export function useSessionMonitor() {
  const { user } = useUser();
  const handleSessionRemoval = useHandleSessionRemoval();
  const pusherRef = useRef<PusherClient | null>(null);
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!user) return;

    const setupPusher = () => {
      try {
        if (pusherRef.current) {
          pusherRef.current.disconnect();
        }

        pusherRef.current = getPusherClientInstance();
        
        pusherRef.current.connection.bind("error", (error: any) => {
          console.error("Pusher connection error:", error);
          if (pusherRef.current?.connection.state !== "connected") {
            setTimeout(setupPusher, 5000);
          }
        });

        pusherRef.current.connection.bind("disconnected", () => {
          setTimeout(setupPusher, 5000);
        });

        channelRef.current = pusherRef.current
          .subscribe("private-session")
          .bind(
            `evt::revoke-${user.id}`,
            (data: { type: string; data: string[] }) => {
              if (data.type === "session-revoked") {
                handleSessionRemoval(data.data);
              }
            },
          );
      } catch (error) {
        console.error("Error initializing Pusher:", error);
        cleanup();
        setTimeout(setupPusher, 5000);
      }
    };

    const cleanup = () => {
      if (channelRef.current) {
        channelRef.current.unbind_all();
        channelRef.current = null;
      }
      if (pusherRef.current) {
        pusherRef.current.unsubscribe("private-session");
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
    };

    setupPusher();
    return cleanup;
  }, [user, handleSessionRemoval]);
} 