import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const publicRoutes = createRouteMatcher(["/", "/sign-in", "/sign-up"]);
const ignoredRoutes = createRouteMatcher(["/api/pusher/auth", "/api/clerk-webhook"]);

export default clerkMiddleware((auth, req) => {
  if (publicRoutes(req) || ignoredRoutes(req)) {
    return;
  }
});

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
}; 