import type { Config } from "drizzle-kit"

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not set")
}

export default {
  schema: "./packages/db/src/drizzle-schema.ts",
  out: "./packages/db/src/drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    table: "migrations",
  },
} satisfies Config
