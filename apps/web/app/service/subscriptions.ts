import { err, fromPromise, ok, type AppResult } from "@/lib/result"
import type { Schema, Subscription, SubscriptionAccount, SubscriptionTemplate } from "@carteira/db"
import {
  subscriptionAccountInsertSchema,
  subscriptionInsertSchema,
  subscriptionTemplateInsertSchema,
} from "@carteira/db"
import type { Zero } from "@rocicorp/zero"

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
    userId: string
  }

  export async function createSubscription(
    z: Zero<Schema>,
    values: CreateNewSubscriptionParams
  ): Promise<AppResult<{ subscriptionId: string }, SubscriptionServiceError>> {
    const safeParseSubscription = subscriptionInsertSchema.safeParse(values.subscription)
    if (!safeParseSubscription.success) {
      return err({
        type: "invalid_subscription",
        message: genericErrorMessages,
      })
    }
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

    const insertResult = await fromPromise(
      z.mutateBatch((tx) => {
        tx.subscription.insert({
          ...safeParseSubscription.data,
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime(),
        })
        tx.subscriptionAccount.insert({
          ...safeParseSubscriptionAccount.data,
          subscriptionId: safeParseSubscription.data.id,
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime(),
        })
      }),
      (error) => {
        console.error(error)
        return {
          type: "invalid_insert",
          message: genericErrorMessages,
        }
      }
    )

    console.log(insertResult)

    // try {
    //   const uuid = uuidv4()
    //   const data = {
    //     id: uuid,
    //     ownerId: z.userID || "",
    //     templateId: values.templateId,
    //     name: values.name,
    //     description: values.description,
    //     type: "private",
    //     maxMembers: Number(values.maxMembers),
    //     princeInCents: totalPriceInCents,
    //     renewalDay: dueDay,
    //     status: "active",
    //   }
    //   await z.mutate.subscription.insert(data)
    //   return uuid
    // } catch (error) {
    //   console.error(error)
    //   toast.error("Erro ao criar assinatura", {
    //     description: "Ocorreu um erro ao criar sua assinatura. Por favor, tente novamente.",
    //   })
    // }
    return ok({ subscriptionId: "123" })
  }
}
