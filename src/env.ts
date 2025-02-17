export const env = {
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ?? "",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",
    PUSHER_APP_ID: process.env.PUSHER_APP_ID ?? "",
    NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY ?? "",
    PUSHER_SECRET: process.env.PUSHER_SECRET ?? "",
    NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "",
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET ?? "",
    ZERO_UPSTREAM_DB: process.env.ZERO_UPSTREAM_DB ?? "",
    ZERO_CVR_DB: process.env.ZERO_CVR_DB ?? "",
    ZERO_CHANGE_DB: process.env.ZERO_CHANGE_DB ?? "",
    ZERO_AUTH_SECRET: process.env.ZERO_AUTH_SECRET ?? "dev-secret-key",
    ZERO_REPLICA_FILE: process.env.ZERO_REPLICA_FILE ?? "/tmp/carteira_replica.db",
};
