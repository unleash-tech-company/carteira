import { Zero } from "@rocicorp/zero";
import { schema, type Schema } from "./schema/posts";
import { env } from "@/env";

export type Client = Zero<Schema>;

let clientInstance: Client | null = null;

export function createClient(userID: string): Client {
  if (typeof window === "undefined") {
    throw new Error("Zero client can only be created in the browser");
  }

  if (!clientInstance) {
    clientInstance = new Zero({
      userID,
      auth: env.ZERO_AUTH_SECRET,
      server: "/zero-cache",
      schema,
      kvStore: "idb",
    });
  }

  return clientInstance;
} 