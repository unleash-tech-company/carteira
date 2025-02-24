import { err, ok, type AppResult } from "@/lib/result"
import type { Schema, Subscription, SubscriptionAccount, SubscriptionTemplate } from "@carteira/db"
import {
  subscriptionAccountInsertSchema,
  subscriptionInsertSchema,
  subscriptionTemplateInsertSchema,
} from "@carteira/db"
import type { Zero } from "@rocicorp/zero"
import { v4 } from "uuid"

type SubscriptionServiceError = {
  type: "invalid_subscription" | "invalid_subscription_template" | "invalid_subscription_account" | "invalid_insert"
  message: string
}
const genericErrorMessages = "Desculpe, algo deu errado. Por favor, tente novamente mais tarde."

export namespace SubscriptionService {
  export type CreateNewSubscriptionParams = {
    subscription: Subscription
    subscriptionAccount: SubscriptionAccount
    subscriptionTemplate: SubscriptionTemplate
  }

  export async function createSubscription(
    z: Zero<Schema>,
    userId: string,
    values: CreateNewSubscriptionParams
  ): Promise<AppResult<{ subscriptionId: string }, SubscriptionServiceError>> {
    const safeParseSubscription = subscriptionInsertSchema.safeParse(values.subscription)

    if (!safeParseSubscription.success) {
      console.error(safeParseSubscription.error)
      return err({
        type: "invalid_subscription",
        message: genericErrorMessages,
      })
    }
    const [maybeSubscriptionTemplate] = await z.query.subscriptionTemplate
      .where("id", "=", values.subscriptionTemplate.id)
      .limit(1)
      .run()

    const safeParseSubscriptionTemplate = subscriptionTemplateInsertSchema.safeParse(values.subscriptionTemplate)
    if (!safeParseSubscriptionTemplate.success) {
      return err({
        type: "invalid_subscription_template",
        message: genericErrorMessages,
      })
    }

    const safeParseSubscriptionAccount = subscriptionAccountInsertSchema.safeParse(values.subscriptionAccount)
    if (!safeParseSubscriptionAccount.success) {
      return err({
        type: "invalid_subscription_account",
        message: genericErrorMessages,
      })
    }

    const subscription: Subscription = {
      ...safeParseSubscription.data,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      ownerId: userId,
      description: safeParseSubscription.data.description ?? null,
      type: safeParseSubscription.data.type ?? null,
      status: safeParseSubscription.data.status ?? null,
      id: v4(),
    }
    const subscriptionAccount: SubscriptionAccount = {
      ...safeParseSubscriptionAccount.data,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      subscriptionId: subscription.id,
      accountUserName: safeParseSubscriptionAccount.data.accountUserName ?? null,
      encryptedAccountPassword: safeParseSubscriptionAccount.data.encryptedAccountPassword ?? null,
      id: v4(),
    }

    await z.mutateBatch(async (tx) => {
      await tx.subscription.insert(subscription)
      await tx.subscriptionAccount.insert(subscriptionAccount)
    })
    const checkIfReallyInserted = z.query.subscription.where("id", "=", subscription.id).limit(1).run()
    if (checkIfReallyInserted.length === 0) {
      return err({
        type: "invalid_insert",
        message: genericErrorMessages,
      })
    }

    return ok({ subscriptionId: subscription.id })
  }
}
