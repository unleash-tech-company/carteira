import type { Schema } from "@/db/schema"
import type { FormNewSubscription } from "@/routes/_a.app_.subscriptions.new"
import type { Zero } from "@rocicorp/zero"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"

export async function createSubscription(z: Zero<Schema>, values: FormNewSubscription) {
  const totalPriceInCents = Number(values.price.replace(/\D/g, ""))
  const dueDay = parseInt(values.dueDate)
  try {
    const uuid = uuidv4()
    const data = {
      id: uuid,
      ownerId: z.userID || "",
      templateId: values.templateId,
      name: values.name,
      description: values.description,
      type: "private",
      maxMembers: Number(values.maxMembers),
      princeInCents: totalPriceInCents,
      renewalDay: dueDay,
      status: "active",
    }
    await z.mutate.subscription.insert(data)
    return uuid
  } catch (error) {
    console.error(error)
    toast.error("Erro ao criar assinatura", {
      description: "Ocorreu um erro ao criar sua assinatura. Por favor, tente novamente.",
    })
  }
}
