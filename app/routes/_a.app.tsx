import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { TypographyH1, TypographyH2, TypographyP } from "@/components/ui/typography"
import type { Schema } from "@/db/schema"
import { cn } from "@/lib/utils"
import { useQuery, useZero } from "@rocicorp/zero/react"
import { DollarSign, Share2, Wallet } from "lucide-react"
import { Link, useNavigate } from "react-router"

export default function ProtectedPage() {
  return (
    <main className="container mx-auto py-8">
      <TypographyH1>Gerenciamento de Assinaturas</TypographyH1>
      <SubscriptionList />
    </main>
  )
}

const useSubscriptionLists = () => {
  const z = useZero<Schema>()
  const [subscriptions, subscriptionDetails] = useQuery(z.query.subscription)
  const isLoading = subscriptionDetails.type !== "complete"
  return { subscriptions, isLoading }
}

function SubscriptionListSkeleton() {
  return (
    <div className={cn("grid grid-cols-1 gap-4", "sm:grid-cols-2", "lg:grid-cols-3")}>
      {[1, 2, 3].map((i) => (
        <div key={i} className={cn("flex flex-col", "p-6 space-y-4", "bg-card rounded-lg border", "animate-pulse")}>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>

          <div className={cn("flex justify-end", "pt-4 mt-auto")}>
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SubscriptionList() {
  const { isLoading } = useSubscriptionLists()

  return (
    <div className={cn("space-y-4", "p-4")}>
      <div className={cn("flex items-center", "justify-between")}>
        <TypographyH2>Suas Assinaturas</TypographyH2>
        <Link to="/app/subscriptions/new">
          <Button variant="outline">Adicionar Assinatura</Button>
        </Link>
      </div>
      {isLoading ? <SubscriptionListSkeleton /> : <SubscriptionList.MySubscriptions />}
    </div>
  )
}

SubscriptionList.MySubscriptions = () => {
  const navigate = useNavigate()
  const z = useZero<Schema>()
  const { subscriptions, isLoading } = useSubscriptionLists()
  const handleDeleteSubscription = (id: string) => {
    z.mutate.subscription.delete({ id })
  }

  return (
    <>
      {subscriptions.length === 0 ? (
        <div className="flex justify-center">
          <EmptyState
            title="Nenhuma assinatura encontrada"
            description="Adicione uma assinatura para começar a gerenciar suas assinaturas compartilhadas e economize dinheiro dividindo com amigos."
            icons={[DollarSign, Share2, Wallet]}
            action={{
              label: "Adicionar Assinatura",
              onClick: () => {
                navigate("/app/subscriptions/new")
              },
            }}
          />
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
