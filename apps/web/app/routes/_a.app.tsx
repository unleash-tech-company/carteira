import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { TypographyH2, TypographyMuted, TypographyP } from "@/components/ui/typography"
import { cn } from "@/lib/utils"
import type { Schema } from "@carteira/db"
import { useQuery, useZero } from "@rocicorp/zero/react"
import { Check, CreditCard, DollarSign, Plus, Share2, Users, Wallet } from "lucide-react"
import { useNavigate } from "react-router"
import { match } from "ts-pattern"

export default function ProtectedPage() {
  return (
    <main className="container mx-auto py-8">
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
    <div className={cn("grid gap-4", "grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3", "xl:grid-cols-4")}>
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
  const { isLoading } = useSubscriptionLists()
  const navigate = useNavigate()

  return (
    <div className={cn("space-y-6")}>
      <div className={cn("flex items-center gap-3")}>
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
      {isLoading ? <SubscriptionListSkeleton /> : <SubscriptionList.MySubscriptions />}
    </div>
  )
}

SubscriptionList.MySubscriptions = () => {
  const navigate = useNavigate()
  const z = useZero<Schema>()
  const { subscriptions, isLoading } = useSubscriptionLists()

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
        <div className={cn("grid gap-4", "grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3", "xl:grid-cols-4")}>
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
                  {match(subscription.templateId)
                    .with(null, () => null)
                    .otherwise(() => (
                      <Check className="w-5 h-5 text-green-500" />
                    ))}
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
                  <TypographyP className="text-sm">R$ {(subscription.princeInCents / 100).toFixed(2)}</TypographyP>
                </div>

                {!subscription.templateId && (
                  <TypographyMuted className="text-xs">Aguardando aprovação do template</TypographyMuted>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
