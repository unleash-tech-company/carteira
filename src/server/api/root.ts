import { router } from "./trpc";
import { postsRouter } from "./routers/posts";

export const appRouter = router({
  posts: postsRouter,
});

export type AppRouter = typeof appRouter; 