'use client';

import { useSessionMonitor } from "@/hooks/use-session-monitor";
import { clerkClient } from "@clerk/nextjs/server";
import { useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { getPusherInstance } from "@/lib/pusher";
import type { Session } from "@clerk/nextjs/server";

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  useSessionMonitor();

  useEffect(() => {
    let isCheckingSession = false;

    const checkExcessSessions = async () => {
      if (!user || isCheckingSession) return;

      try {
        isCheckingSession = true;
        const clerk = await clerkClient();
        const activeSessions = await clerk.sessions.getSessionList({
          userId: user.id,
          status: "active",
        });

        if (activeSessions.totalCount <= 1) return;

        // Get current session token
        const sessionToken = await getToken();
        if (!sessionToken) return;

        // Get current session
        const currentSession = await clerk.sessions.getSession(sessionToken);
        
        const excessSessionsIds = activeSessions.data
          .filter((session: Session) => session.id !== currentSession.id)
          .map((session: Session) => session.id);

        // Revoke excess sessions
        await Promise.all(
          excessSessionsIds.map((sessionId: string) =>
            clerk.sessions.revokeSession(sessionId)
          )
        );

        // Notify through Pusher
        const pusher = getPusherInstance();
        await pusher.trigger("private-session", `evt::revoke-${user.id}`, {
          type: "session-revoked",
          data: excessSessionsIds,
        });
      } catch (error) {
        console.error("Error checking sessions:", error);
      } finally {
        isCheckingSession = false;
      }
    };

    if (isLoaded && user) {
      checkExcessSessions();
    }
  }, [user, isLoaded, getToken]);

  return <>{children}</>;
} 