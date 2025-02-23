import type { Schema } from "@/db/schema"
import type { Zero } from "@rocicorp/zero"

export function querySubscriptionTemplates(z: Zero<Schema>) {
  return z.query.subscriptionTemplate.where((q) => q.cmp("approved", true))
}
