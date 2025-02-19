import PusherClient from "pusher-js"

const PUSHER_AUTH_ENDPOINT = "/api/pusher/auth"

let pusherClientInstance: PusherClient | null = null

export const getPusherClientInstance = () => {
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(import.meta.env.VITE_PUSHER_KEY!, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER!,
      authEndpoint: PUSHER_AUTH_ENDPOINT,
    })
  }
  return pusherClientInstance
}
