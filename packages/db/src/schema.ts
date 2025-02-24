import { ANYONE_CAN, definePermissions, type Condition, type ExpressionBuilder, type Row } from "@rocicorp/zero"
import { createZeroSchema } from "drizzle-zero"
import * as drizzleSchema from "./drizzle-schema"

export const schema = createZeroSchema(drizzleSchema, {
  version: 1,
  tables: {
    subscription: {
      id: true,
      ownerId: true,
      templateId: false,
      name: true,
      description: true,
      type: true,
      maxMembers: true,
      princeInCents: true,
      renewalDay: true,
      createdAt: true,
      updatedAt: true,
      status: true,
    },
    subscriptionTemplate: {
      id: true,
      approved: true,
      name: true,
      description: true,
      type: true,
      recommendedMaxMembers: true,
      recommendedPriceInCents: true,
      category: true,
      provider: true,
      planName: true,
      createdAt: true,
      updatedAt: true,
    },
    subscriptionAccount: {
      id: true,
      subscriptionId: true,
      accountUserName: true,
      encryptedAccountPassword: true,
      createdAt: true,
      updatedAt: true,
    },
    usersAllowedInASubscription: {
      id: true,
      subscriptionId: true,
      userId: true,
    },
    user: {
      id: true,
      name: true,
      email: true,
    },
  },
  manyToMany: {
    subscription: {
      allowedUsers: [
        {
          sourceField: ["id"],
          destField: ["subscriptionId"],
          destTable: "usersAllowedInASubscription",
        },
        {
          sourceField: ["userId"],
          destField: ["id"],
          destTable: "user",
        },
      ],
    },
  },
})

export type Schema = typeof schema
type TableName = keyof Schema["tables"]
type PermissionRule<TTable extends TableName> = (authData: AuthData, eb: ExpressionBuilder<Schema, TTable>) => Condition

// #region Types

export type Subscription = Row<typeof schema.tables.subscription>
export type SubscriptionTemplate = Row<typeof schema.tables.subscriptionTemplate>
export type SubscriptionAccount = Row<typeof schema.tables.subscriptionAccount>
// #endregion

// The contents of your decoded JWT.
type AuthData = {
  sub: string | null
}

export function and<TTable extends TableName>(...rules: PermissionRule<TTable>[]): PermissionRule<TTable> {
  return (authData, eb) => eb.and(...rules.map((rule) => rule(authData, eb)))
}

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
  const allowIfSubscriptionOwner = (authData: AuthData, { cmp }: ExpressionBuilder<Schema, "subscription">) =>
    cmp("ownerId", "=", authData.sub ?? "")
  const allowIfIsInWhitelist = (authData: AuthData, { exists }: ExpressionBuilder<Schema, "subscription">) =>
    exists("allowedUsers", (q) => q.where((q) => q.cmp("id", "=", authData.sub || "")))
  const allowTemplateSelect = (_authData: AuthData, { cmp }: ExpressionBuilder<Schema, "subscriptionTemplate">) =>
    cmp("id", "!=", "")
  const denyTemplateModification = (_authData: AuthData, { cmp }: ExpressionBuilder<Schema, "subscriptionTemplate">) =>
    cmp("id", "=", "")

  return {
    subscription: {
      row: {
        delete: [allowIfSubscriptionOwner],
        update: {
          putMutation: [allowIfSubscriptionOwner],
          postMutation: [allowIfSubscriptionOwner],
        },
        select: [allowIfSubscriptionOwner, allowIfIsInWhitelist],
        insert: [allowIfSubscriptionOwner],
      },
    },
    subscriptionAccount: {
      row: {
        insert: ANYONE_CAN,
      },
    },
    subscriptionTemplate: {
      row: {
        select: [allowTemplateSelect],
        insert: [denyTemplateModification],
        update: {
          postMutation: [denyTemplateModification],
          putMutation: [denyTemplateModification],
        },
        delete: [denyTemplateModification],
      },
    },
  }
})
