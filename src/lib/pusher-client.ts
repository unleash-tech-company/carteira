import PusherClient from "pusher-js";

const PUSHER_AUTH_ENDPOINT = "/api/pusher/auth";

let pusherClientInstance: PusherClient | null = null;

export const getPusherClientInstance = () => {
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        authEndpoint: PUSHER_AUTH_ENDPOINT,
      }
    );
  }
  return pusherClientInstance;
}; 