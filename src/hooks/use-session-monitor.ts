import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getPusherClientInstance } from "@/lib/pusher-client";
import { useRouter } from "next/navigation";

export function useSessionMonitor() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const pusher = getPusherClientInstance();
    const channel = pusher.subscribe(`user-${user.id}`);

    channel.bind("session-created", (data: { sessionId: string }) => {
      console.log("New session created:", data.sessionId);
      // You can show a notification here if you want
    });

    channel.bind("session-removed", (data: { sessionId: string }) => {
      console.log("Session ended:", data.sessionId);
      // You can show a notification here if you want
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`user-${user.id}`);
    };
  }, [user]);
} 