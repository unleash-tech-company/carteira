import { initTRPC, TRPCError } from "@trpc/server";
import { getAuth } from "@clerk/nextjs/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { prisma } from "@/server/db";
import { ZodError } from "zod";
import { NextRequest } from "next/server";

const transformer = superjson;

function createInnerTRPCContext(opts: FetchCreateContextFnOptions) {
  const auth = getAuth({
    ...opts.req,
    headers: opts.req.headers,
  } as NextRequest);

  return {
    auth,
    prisma,
    req: opts.req,
  };
}

export async function createTRPCContext(opts: FetchCreateContextFnOptions) {
  const ctx = createInnerTRPCContext(opts);
  return {
    ...ctx,
    resHeaders: opts.resHeaders,
  };
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
        code: error.code,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.auth?.userId) {
    throw new TRPCError({ 
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      auth: ctx.auth,
    },
  });
}); 