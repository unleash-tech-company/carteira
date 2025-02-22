import { relations } from "drizzle-orm"
import { integer, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
})

export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type", { enum: ["private", "public"] })
    .notNull()
    .default("private"),
  maxMembers: integer("max_members").notNull(),
  price: numeric("price").notNull(),
  renewalDate: timestamp("renewal_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  status: text("status").notNull().default("active"),
})
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
}))
