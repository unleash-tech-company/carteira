import { relations } from "drizzle-orm"
import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-zod"

const timeStampColumns = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
})

export const subscription = pgTable("subscription", {
  ...timeStampColumns,
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
  renewalDay: integer("renewal_day").notNull(),
  status: text("status").notNull().default("active"),
})

export const subscriptionTemplate = pgTable("subscription_template", {
  ...timeStampColumns,
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
})

export const subscriptionAccount = pgTable("subscription_account", {
  ...timeStampColumns,
  id: text("id").primaryKey(),
  subscriptionId: text("subscription_id").references(() => subscription.id),
  accountUserName: text("account_user_name").notNull(),
  encryptedAccountPassword: text("encrypted_account_password").notNull(),
})

export const subscriptionInsertSchema = createInsertSchema(subscription)
export const subscriptionTemplateInsertSchema = createInsertSchema(subscriptionTemplate)
export const subscriptionAccountInsertSchema = createInsertSchema(subscriptionAccount)

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
  account: one(subscriptionAccount, {
    fields: [subscription.id],
    references: [subscriptionAccount.subscriptionId],
  }),
  template: one(subscriptionTemplate, {
    fields: [subscription.templateId],
    references: [subscriptionTemplate.id],
  }),
}))

export const subscriptionTemplateRelations = relations(subscriptionTemplate, ({ many }) => ({
  subscriptions: many(subscription),
}))
