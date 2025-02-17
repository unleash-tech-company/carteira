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
  const channelRef = useRef<Channel | null>(null);
  const handleSessionRemoval = useHandleSessionRemoval();

  useEffect(() => {
    if (!user) return;

    const pusherClient = getPusherClientInstance();
    const channel = pusherClient.subscribe("private-session");

    channelRef.current = channel;

    channel.bind(`evt::session-${user.id}`, async (data: { 
      type: string; 
      data: { 
        sessionId: string;
        message: string;
      }; 
    }) => {
      if (data.type === "session-ended" || data.type === "session-created") {
        const { sessionId } = data.data;
        await handleSessionRemoval([sessionId]);
      }
    });

    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all();
        channelRef.current.unsubscribe();
      }
    };
  }, [user, handleSessionRemoval]);
} 