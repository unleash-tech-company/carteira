import { useEffect, useRef, useCallback } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import type { Channel } from "pusher-js";
import { getPusherClientInstance } from "@/lib/pusher-client";
import { useLogout } from "@/utils/auth";

const MAX_SESSIONS = 1; // Allow only one active session

interface Session {
  id: string;
  lastActiveAt: string;
  createdAt: string;
}

interface SessionsResponse {
  sessions: Session[];
  error?: string;
}

interface SessionEvent {
  type: "session-created" | "session-ended";
  data: {
    sessionId: string;
    message: string;
  };
}

export function useSessionMonitor() {
  const { user } = useUser();
  const clerk = useClerk();
  const logout = useLogout();
  const channelRef = useRef<Channel | null>(null);

  const handleSessionManagement = useCallback(async (newSessionId?: string) => {
    if (!clerk.session) {
      console.log('[Session Monitor] No active session');
      return;
    }

    try {
      const response = await fetch("/api/sessions");
      const data: SessionsResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch sessions');
      }

      const { sessions } = data;
      
      if (!sessions || sessions.length === 0) {
        console.log('[Session Monitor] No sessions found');
        return;
      }

      console.log('[Session Monitor] Active sessions:', {
        count: sessions.length,
        sessions: sessions.map(session => ({
          id: session.id,
          createdAt: session.createdAt,
          current: session.id === clerk.session?.id
        }))
      });

      // If we're within the session limit, no action needed
      if (sessions.length <= MAX_SESSIONS) {
        console.log('[Session Monitor] Session count within limits');
        return;
      }

      // Sort sessions by creation time, newest first (matching webhook behavior)
      const sortedSessions = [...sessions].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const currentSession = clerk.session;
      const isCurrentSessionNewest = sortedSessions[0]?.id === currentSession.id;

      if (!isCurrentSessionNewest) {
        // Current session is not the newest, log it out
        console.log('[Session Monitor] Current session is older, logging out');
        await logout(currentSession.id, "new_device_login");
      } else {
        // We are the newest session, revoke all older ones
        const olderSessions = sortedSessions.slice(1);
        console.log('[Session Monitor] Revoking older sessions:', olderSessions.map(s => s.id));
        
        await Promise.all(
          olderSessions.map(async (session) => {
            try {
              await clerk.signOut({ sessionId: session.id });
            } catch (error) {
              console.error('[Session Monitor] Failed to revoke session:', session.id, error);
            }
          })
        );
      }
    } catch (error) {
      console.error('[Session Monitor] Session management error:', error);
      if (clerk.session) {
        await logout(clerk.session.id, "session_verification_failed");
      }
    }
  }, [clerk, logout]);

  useEffect(() => {
    if (!user) {
      console.log('[Session Monitor] No user, skipping monitor setup');
      return;
    }

    let mounted = true;

    const setupMonitor = async () => {
      try {
        console.log('[Session Monitor] Starting monitor for user:', user.id);
        
        const pusherClient = getPusherClientInstance();
        const channel = pusherClient.subscribe("private-session");
        
        if (mounted) {
          channelRef.current = channel;
          
          // Initial session check
          await handleSessionManagement();

          channel.bind(`evt::session-${user.id}`, async (event: SessionEvent) => {
            if (!mounted) return;
            
            console.log('[Session Monitor] Received event:', event);
            
            try {
              switch (event.type) {
                case "session-created":
                  await handleSessionManagement(event.data.sessionId);
                  break;
                case "session-ended":
                  await handleSessionManagement();
                  break;
                default:
                  console.warn('[Session Monitor] Unknown event type:', event.type);
              }
            } catch (error) {
              console.error('[Session Monitor] Event handling error:', error);
            }
          });
        }
      } catch (error) {
        console.error('[Session Monitor] Setup error:', error);
      }
    };

    setupMonitor();

    return () => {
      mounted = false;
      if (channelRef.current) {
        console.log('[Session Monitor] Cleaning up monitor for user:', user.id);
        channelRef.current.unbind_all();
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [user, handleSessionManagement]);
}