import type { Schema } from "@/db/schema"
import { useQuery, useZero } from "@rocicorp/zero/react"

export function useSubscriptionTemplates() {
  const z = useZero<Schema>()
  const [templates, templateDetails] = useQuery(z.query.subscriptionTemplate)
  const isLoading = templateDetails.type !== "complete"

  return {
    templates,
    isLoading,
  }
}
