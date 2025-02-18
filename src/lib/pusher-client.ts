import { env } from "@/env";
import PusherClient from "pusher-js";

const PUSHER_AUTH_ENDPOINT = "/api/pusher/auth";

let pusherClientInstance: PusherClient | null = null;

export const getPusherClientInstance = () => {
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        authEndpoint: PUSHER_AUTH_ENDPOINT,
      }
    );
  }
  return pusherClientInstance;
}; 