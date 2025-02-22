import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TypographyH2 } from "@/components/ui/typography"
import type { Schema } from "@/db/schema"
import { useZero } from "@rocicorp/zero/react"
import { Form, isRouteErrorResponse, redirect, useNavigate, useRouteError } from "react-router"

export async function action({ request }: { request: Request }) {
  const formData = await request.formData()
  const subscriptionId = formData.get("subscriptionId") as string

  if (!subscriptionId?.trim()) {
    return { error: "ID da assinatura é obrigatório" }
  }

  const z = useZero<Schema>()
  await z.mutate.subscription.insert({
    id: subscriptionId,
    ownerId: z.userID || "",
  })

  return redirect("/app")
}

export default function NovaAssinatura() {
  const navigate = useNavigate()

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => navigate("/app")}>
          Voltar
        </Button>
        <TypographyH2>Nova Assinatura</TypographyH2>
      </div>

      <div className="max-w-xl">
        <Form method="post" className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="subscriptionId" className="text-sm font-medium">
              ID da Assinatura
            </label>
            <Input id="subscriptionId" name="subscriptionId" placeholder="Digite o ID da assinatura" required />
          </div>

          <div className="flex gap-4">
            <Button variant="outline" type="button" onClick={() => navigate("/app")}>
              Cancelar
            </Button>
            <Button type="submit">Criar Assinatura</Button>
          </div>
        </Form>
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
