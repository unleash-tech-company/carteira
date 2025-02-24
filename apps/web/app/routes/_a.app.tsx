import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { TypographyH2, TypographyP } from "@/components/ui/typography"
import { formatCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"
import type { Schema } from "@carteira/db"
import { useQuery, useZero } from "@rocicorp/zero/react"
import { ArrowRight, CreditCard, DollarSign, Plus, Share2, Users, Wallet } from "lucide-react"
import { useNavigate } from "react-router"

export default function ProtectedPage() {
  return (
    <main className="container mx-auto py-8">
      <SubscriptionList />
    </main>
  )
}

const useSubscriptionLists = () => {
  const z = useZero<Schema>()
  const [subscriptions, subscriptionDetails] = useQuery(z.query.subscription.limit(3))
  const isLoading = subscriptionDetails.type !== "complete"
  return { subscriptions, isLoading }
}

function SubscriptionListSkeleton() {
  return (
    <div className={cn("grid gap-4", "grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3")}>
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function SubscriptionList() {
  const { isLoading, subscriptions } = useSubscriptionLists()
  const navigate = useNavigate()

  return (
    <div className={cn("space-y-6")}>
      <div className={cn("flex items-center justify-between")}>
        <TypographyH2>Minhas Assinaturas</TypographyH2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate("/app/subscriptions/new")}>
              Criar Nova Assinatura
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isLoading ? (
        <SubscriptionListSkeleton />
      ) : subscriptions.length === 0 ? (
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
        <>
          <div className={cn("grid gap-4", "grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3")}>
            {subscriptions.map((subscription) => (
              <Card
                key={subscription.id}
                className="group hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/app/subscriptions/${subscription.id}`)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      <span>{subscription.name}</span>
                    </div>
                  </CardTitle>
                  <CardDescription>{subscription.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <TypographyP className="text-sm text-muted-foreground">Membros</TypographyP>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {/* TODO: Implementar contagem de membros */}0 / {subscription.maxMembers}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <TypographyP className="text-sm text-muted-foreground">Valor</TypographyP>
                    <TypographyP className="text-sm">
                      {formatCurrency({ valueInCents: subscription.princeInCents })}
                    </TypographyP>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center">
            <Button variant="outline" className="group" onClick={() => navigate("/app/subscriptions")}>
              Ver todas as assinaturas
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
