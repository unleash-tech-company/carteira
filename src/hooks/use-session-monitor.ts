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
      console.log('[Session Monitor] Signing out session:', currentSessionId);
      await signOut(() => {
        router.push(`/sign-in?forcedRedirect=true`);
      }, {
        sessionId: currentSessionId
      });
    } catch (error) {
      console.error('[Session Monitor] Error signing out:', error);
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

      console.log('[Session Monitor] Checking sessions:', {
        hasExcess,
        isCurrentSessionExcess,
        currentSessionId: currentSession?.id,
        excessSessionIds
      });

      if (!isCurrentSessionExcess) return;

      await handleSignOut(currentSession.id);
    } catch (error) {
      console.error('[Session Monitor] Error removing session:', error);
    }
  };
};

export function useSessionMonitor() {
  const { user } = useUser();
  const channelRef = useRef<Channel | null>(null);
  const handleSessionRemoval = useHandleSessionRemoval();

  useEffect(() => {
    if (!user) return;

    console.log('[Session Monitor] Starting monitor for user:', user.id);
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
      console.log('[Session Monitor] Received event:', data);
      if (data.type === "session-ended" || data.type === "session-created") {
        const { sessionId } = data.data;
        await handleSessionRemoval([sessionId]);
      }
    });

    return () => {
      if (channelRef.current) {
        console.log('[Session Monitor] Cleaning up monitor for user:', user.id);
        channelRef.current.unbind_all();
        channelRef.current.unsubscribe();
      }
    };
  }, [user, handleSessionRemoval]);
} 