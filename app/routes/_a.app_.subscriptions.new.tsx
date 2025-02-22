import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TypographyH2 } from "@/components/ui/typography"
import type { Schema } from "@/db/schema"
import { useZero } from "@rocicorp/zero/react"
import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router"
import { v4 as uuidv4 } from "uuid"

export default function NovaAssinatura() {
  const navigate = useNavigate()
  const z = useZero<Schema>()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const maxMembers = Number(formData.get("maxMembers"))
    const price = Number(formData.get("price"))

    if (!name?.trim()) {
      // TODO: Adicionar toast de erro
      return
    }

    try {
      const uuid = uuidv4()
      await z.mutate.subscription.insert({
        id: uuid,
        ownerId: z.userID || "",
        name,
        description,
        type: "private",
        maxMembers,
        price,
        renewalDate: new Date().getTime(),
        status: "active",
      })

      navigate("/app")
    } catch (error) {
      console.error(error)
      // TODO: Adicionar toast de erro
    }
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => navigate("/app")}>
          Voltar
        </Button>
        <TypographyH2>Nova Assinatura</TypographyH2>
      </div>

      <div className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nome da Assinatura
            </label>
            <Input id="name" name="name" placeholder="Digite o nome da assinatura" required />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Descrição
            </label>
            <Input id="description" name="description" placeholder="Digite uma descrição (opcional)" />
          </div>

          <div className="space-y-2">
            <label htmlFor="maxMembers" className="text-sm font-medium">
              Número Máximo de Membros
            </label>
            <Input
              id="maxMembers"
              name="maxMembers"
              type="number"
              min="1"
              placeholder="Digite o número máximo de membros"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium">
              Preço
            </label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="Digite o preço da assinatura"
              required
            />
          </div>

          <div className="flex gap-4">
            <Button variant="outline" type="button" onClick={() => navigate("/app")}>
              Cancelar
            </Button>
            <Button type="submit">Criar Assinatura</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  const navigate = useNavigate()

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => navigate("/app")}>
          Voltar
        </Button>
        <TypographyH2>Erro ao Criar Assinatura</TypographyH2>
      </div>

      <div className="max-w-xl bg-destructive/10 p-4 rounded-lg">
        {isRouteErrorResponse(error) ? (
          <>
            <h2 className="text-lg font-semibold text-destructive">
              {error.status} - {error.statusText}
            </h2>
            <p className="mt-2">{error.data}</p>
          </>
        ) : error instanceof Error ? (
          <>
            <h2 className="text-lg font-semibold text-destructive">Erro</h2>
            <p className="mt-2">{error.message}</p>
          </>
        ) : (
          <h2 className="text-lg font-semibold text-destructive">Erro desconhecido ao criar assinatura</h2>
        )}
      </div>
    </div>
  )
}
