import { relations } from "drizzle-orm"
import { pgTable, text } from "drizzle-orm/pg-core"

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
})

export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
})

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
