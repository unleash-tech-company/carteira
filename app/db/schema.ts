// These data structures define your client-side schema.
// They must be equal to or a subset of the server-side schema.
// Note the "relationships" field, which defines first-class
// relationships between tables.
// See https://github.com/rocicorp/mono/blob/main/apps/zbugs/src/domain/schema.ts
// for more complex examples, including many-to-many.

import {
  createSchema,
  definePermissions,
  relationships,
  string,
  table,
  type Condition,
  type ExpressionBuilder,
  type Row,
} from "@rocicorp/zero"

const Subscription = table("subscription")
  .columns({
    id: string(),
    owner_id: string(),
    // is_public ? - Nesse primeiro momento todas as assinaturas são privadas
  })
  .primaryKey("id")

const SubscriptionPassword = table("subscription_password")
  .columns({
    id: string(),
    subscription_id: string(),
    encrypted_password: string(),
  })
  .primaryKey("id")

const SubscriptionUser = table("subscription_user")
  .columns({
    id: string(),
    subscription_id: string(),
    user_id: string(),
  })
  .primaryKey("id")

const SubscriptionRelationships = relationships(Subscription, ({ one, many }) => ({
  password: one({
    destSchema: SubscriptionPassword,
    destField: ["subscription_id"],
    sourceField: ["id"],
  }),
  usersAllowed: many({
    destSchema: SubscriptionUser,
    destField: ["subscription_id"],
    sourceField: ["id"],
  }),
}))

export const schema = createSchema(1, {
  tables: [Subscription, SubscriptionPassword, SubscriptionUser],
  relationships: [SubscriptionRelationships],
})

export type Schema = typeof schema
type TableName = keyof Schema["tables"]
type PermissionRule<TTable extends TableName> = (authData: AuthData, eb: ExpressionBuilder<Schema, TTable>) => Condition
export type Subscription = Row<typeof schema.tables.subscription>

// The contents of your decoded JWT.
type AuthData = {
  sub: string | null
}

function and<TTable extends TableName>(...rules: PermissionRule<TTable>[]): PermissionRule<TTable> {
  return (authData, eb) => eb.and(...rules.map((rule) => rule(authData, eb)))
}
function or<TTable extends TableName>(...rules: PermissionRule<TTable>[]): PermissionRule<TTable> {
  return (authData, eb) => eb.or(...rules.map((rule) => rule(authData, eb)))
}

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
  const allowIfSubscriptionOwner = (authData: AuthData, { cmp }: ExpressionBuilder<Schema, "subscription">) =>
    cmp("owner_id", "=", authData.sub ?? "")
  const allowIfIsInWhitelist = (authData: AuthData, { exists }: ExpressionBuilder<Schema, "subscription">) =>
    exists("usersAllowed", (q) => q.where((q) => q.cmp("user_id", "=", authData.sub || "")))

  return {
    subscription: {
      row: {
        delete: [allowIfSubscriptionOwner],
        update: {
          postMutation: [allowIfSubscriptionOwner],
          putMutation: [allowIfSubscriptionOwner],
        },
        select: [or(allowIfSubscriptionOwner, allowIfIsInWhitelist)],
        insert: [allowIfSubscriptionOwner],
      },
    },
  }
})
