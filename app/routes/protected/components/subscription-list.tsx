import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TypographyH2, TypographyP } from "@/components/ui/typography"
import type { Schema } from "@/db/schema"
import { cn } from "@/lib/utils"
import { useQuery, useZero } from "@rocicorp/zero/react"
import { useState } from "react"

export function SubscriptionList() {
  const z = useZero<Schema>()
  const [subscriptions] = useQuery(z.query.subscription)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newSubscriptionId, setNewSubscriptionId] = useState("")

  const handleAddSubscription = () => {
    if (!newSubscriptionId.trim()) return

    z.mutate.subscription.insert({
      id: newSubscriptionId,
      owner_id: z.userID || "",
    })

    setNewSubscriptionId("")
    setIsAddDialogOpen(false)
  }

  const handleDeleteSubscription = (id: string) => {
    z.mutate.subscription.delete({ id })
  }

  return (
    <div className={cn("space-y-4", "p-4")}>
      <div className={cn("flex items-center", "justify-between")}>
        <TypographyH2>Suas Assinaturas</TypographyH2>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Adicionar Assinatura</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Assinatura</DialogTitle>
              <DialogDescription>Adicione uma nova assinatura ao seu catálogo.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="ID da Assinatura"
                value={newSubscriptionId}
                onChange={(e) => setNewSubscriptionId(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddSubscription}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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
                <TableCell>{subscription.owner_id}</TableCell>
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
    </div>
  )
}
