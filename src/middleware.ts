import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const publicRoutes = ["^/$", "^/sign-in$", "^/sign-up$"];
const ignoredRoutes = ["^/api/pusher/auth$", "^/api/clerk-webhook$"];

export default clerkMiddleware(async (auth, request) => {
  const user = await auth();
  const pathname = new URL(request.url).pathname;
  
  if (publicRoutes.some(pattern => pathname.match(new RegExp(pattern))) || 
      ignoredRoutes.some(pattern => pathname.match(new RegExp(pattern)))) {
    return NextResponse.next();
  }

  if (!user.userId) {
    const signInUrl = new URL("/sign-in", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
}; 