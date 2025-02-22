import { relations } from "drizzle-orm"
import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { createSelectSchema } from "drizzle-zod"

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
})

export const subscriptionTemplate = pgTable("subscription_template", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  /**
   * Something like "Games", "Streaming", "Music", "Movies", "Books", "Podcasts"
   */
  type: text("type").notNull().default("private"),
  recommendedMaxMembers: integer("recommended_max_members").notNull(),
  recommendedPriceInCents: integer("recommended_price_in_cents").notNull(),
  category: text("category").notNull(), // e.g., "streaming", "music", "games"
  provider: text("provider").notNull(), // e.g., "Netflix", "HBO", "Spotify"
  planName: text("plan_name"), // e.g., "Premium", "Basic", "Family"
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
export type SubscriptionTemplate = typeof subscriptionTemplate.$inferSelect
export type InsertSubscriptionTemplate = typeof subscriptionTemplate.$inferInsert

export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  templateId: text("template_id").references(() => subscriptionTemplate.id),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type", { enum: ["private", "public"] })
    .notNull()
    .default("private"),
  maxMembers: integer("max_members").notNull(),
  princeInCents: integer("prince_in_cents").notNull(),
  renewalDate: timestamp("renewal_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  status: text("status").notNull().default("active"),
})

export const subscriptionSchema = createSelectSchema(subscription)
export type Subscription = typeof subscription.$inferSelect
export type InsertSubscription = typeof subscription.$inferInsert

export const subscriptionPassword = pgTable("subscription_password", {
  subscriptionId: text("subscription_id")
    .notNull()
    .references(() => subscription.id, {
      onDelete: "cascade",
    })
    .primaryKey(),
  encryptedPassword: text("encrypted_password").notNull(),
})

export const usersAllowedInASubscription = pgTable("subscription_user", {
  id: text("id").primaryKey(),
  subscriptionId: text("subscription_id")
    .notNull()
    .references(() => subscription.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id)
    .notNull(),
})

export const subscriptionRelations = relations(subscription, ({ one }) => ({
  password: one(subscriptionPassword, {
    fields: [subscription.id],
    references: [subscriptionPassword.subscriptionId],
  }),
  template: one(subscriptionTemplate, {
    fields: [subscription.templateId],
    references: [subscriptionTemplate.id],
  }),
}))

export const subscriptionTemplateRelations = relations(subscriptionTemplate, ({ many }) => ({
  subscriptions: many(subscription),
}))
