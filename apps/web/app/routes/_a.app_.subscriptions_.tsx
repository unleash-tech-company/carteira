import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { TypographyH2, TypographyP } from "@/components/ui/typography"
import { formatCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"
import type { Schema, Subscription } from "@carteira/db"
import { useQuery, useZero } from "@rocicorp/zero/react"
import { CreditCard, DollarSign, Plus, Share2, Users, Wallet } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router"

const ITEMS_PER_PAGE = 10

export default function SubscriptionsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const navigate = useNavigate()
  const z = useZero<Schema>()
  const [totalCount, totalDetails] = useQuery(z.query.subscription)
  const [subscriptions, subscriptionDetails] = useQuery(z.query.subscription)
  const isLoading = subscriptionDetails.type !== "complete" || totalDetails.type !== "complete"
  const totalSubscriptions = totalCount?.length ?? 0
  const paginatedSubscriptions =
    subscriptions?.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE) ?? []
  const totalPages = Math.ceil(totalSubscriptions / ITEMS_PER_PAGE)

  return (
    <main className="container mx-auto py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
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
        ) : paginatedSubscriptions.length === 0 ? (
          <div className="flex justify-center">
            <EmptyState
              title="Nenhuma assinatura encontrada"
              description="Adicione uma assinatura para começar a gerenciar suas assinaturas compartilhadas e economize dinheiro dividindo com amigos."
              icons={[DollarSign, Share2, Wallet]}
              action={{
                label: "Adicionar Assinatura",
                onClick: () => navigate("/app/subscriptions/new"),
              }}
            />
          </div>
        ) : (
          <>
            <div className={cn("grid gap-4", "grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3", "xl:grid-cols-4")}>
              {paginatedSubscriptions.map((subscription: Subscription) => (
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

            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage > 1) setCurrentPage(currentPage - 1)
                        }}
                        className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                      />
                    </PaginationItem>

                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1
                      // Show first page, current page, last page, and pages around current page
                      if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage(page)
                              }}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      }
                      // Show ellipsis for gaps
                      if (page === 2 || page === totalPages - 1) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )
                      }
                      return null
                    })}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                        }}
                        className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

function SubscriptionListSkeleton() {
  return (
    <div className={cn("grid gap-4", "grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3", "xl:grid-cols-4")}>
      {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
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
