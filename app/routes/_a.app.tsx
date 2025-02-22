import { Button } from "@/components/ui/button"
import { TypographyH1, TypographyH2, TypographyP } from "@/components/ui/typography"
import type { Schema } from "@/db/schema"
import { cn, TODO } from "@/lib/utils"
import { useQuery, useZero } from "@rocicorp/zero/react"
import { Link } from "react-router"

export default function ProtectedPage() {
  return (
    <main className="container mx-auto py-8">
      <TypographyH1>Gerenciamento de Assinaturas</TypographyH1>
      <SubscriptionList />
    </main>
  )
}

const useSubscriptionLists = () => {
  TODO("Tem que filtrar isso aqui por userID")
  const z = useZero<Schema>()
  const [subscriptions, subscriptionDetails] = useQuery(z.query.subscription)
  const isLoading = subscriptionDetails.type !== "complete"
  return { subscriptions, isLoading }
}

export function SubscriptionList() {
  return (
    <div className={cn("space-y-4", "p-4")}>
      <div className={cn("flex items-center", "justify-between")}>
        <TypographyH2>Suas Assinaturas</TypographyH2>
        <Link to="/app/subscriptions/new">
          <Button variant="outline">Adicionar Assinatura</Button>
        </Link>
      </div>
      <SubscriptionList.MySubscriptions />
    </div>
  )
}

SubscriptionList.MySubscriptions = () => {
  const z = useZero<Schema>()
  const { subscriptions, isLoading } = useSubscriptionLists()
  const handleDeleteSubscription = (id: string) => {
    z.mutate.subscription.delete({ id })
  }

  return (
    <>
      {subscriptions.length === 0 ? (
        <div className={cn("flex flex-col items-center justify-center", "p-8 rounded-lg", "bg-muted/50")}>
          <TypographyP>Nenhuma assinatura encontrada.</TypographyP>
        </div>
      ) : (
        <div className={cn("grid grid-cols-1 gap-4", "sm:grid-cols-2", "lg:grid-cols-3")}>
          {subscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className={cn(
                "flex flex-col",
                "p-6 space-y-4",
                "bg-card rounded-lg border",
                "hover:shadow-md transition-shadow"
              )}
            >
              <div className="space-y-2">
                <TypographyP className="font-medium">ID da Assinatura</TypographyP>
                <TypographyP className="text-muted-foreground">{subscription.id}</TypographyP>
              </div>

              <div className="space-y-2">
                <TypographyP className="font-medium">Proprietário</TypographyP>
                <TypographyP className="text-muted-foreground">{subscription.ownerId}</TypographyP>
              </div>

              <div className={cn("flex justify-end", "pt-4 mt-auto")}>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteSubscription(subscription.id)}>
                  Deletar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
