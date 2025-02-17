import appRouter from "@/server"
import { handle } from "hono/vercel"

// This route catches all incoming API requests and lets your appRouter handle them.
export const GET = appRouter.handler
export const POST = appRouter.handler
