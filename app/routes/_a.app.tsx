import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
        <Link to="/app/subscriptions/new">Adicionar Assinatura</Link>
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
        <TypographyP>Nenhuma assinatura encontrada.</TypographyP>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Proprietário</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((subscription) => (
              <TableRow key={subscription.id}>
                <TableCell>{subscription.id}</TableCell>
                <TableCell>{subscription.ownerId}</TableCell>
                <TableCell className="text-right">
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteSubscription(subscription.id)}>
                    Deletar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  )
}
