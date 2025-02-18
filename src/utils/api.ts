import { createTRPCReact } from "@trpc/react-query";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";

export const api = createTRPCReact<AppRouter>();

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export type PostOutput = RouterOutputs["posts"]["getAll"][number];
export type CreatePostInput = RouterInputs["posts"]["create"];
export type UpdatePostInput = RouterInputs["posts"]["update"];
export type DeletePostInput = RouterInputs["posts"]["delete"];
