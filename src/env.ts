export const env = {
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ?? "",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",
    PUSHER_APP_ID: process.env.PUSHER_APP_ID ?? "",
    NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY ?? "",
    PUSHER_SECRET: process.env.PUSHER_SECRET ?? "",
    NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "",
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET ?? "",
    DATABASE_URL: process.env.DATABASE_URL ?? "",
    NODE_ENV: process.env.NODE_ENV as "development" | "production" | "test" ?? 'development',
};
