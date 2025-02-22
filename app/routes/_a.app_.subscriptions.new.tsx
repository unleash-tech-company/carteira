import { SuccessScreen } from "@/components/subscription/success-screen"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TypographyH2 } from "@/components/ui/typography"
import type { Schema } from "@/db/schema"
import { useZero } from "@rocicorp/zero/react"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import { NumericFormat } from "react-number-format"
import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router"
import { v4 as uuidv4 } from "uuid"

const formSteps = [
  {
    id: "name",
    title: "Nome da Assinatura",
    subtitle: "Como você quer chamar esta assinatura?",
  },
  {
    id: "description",
    title: "Descrição",
    subtitle: "Adicione uma descrição para ajudar os membros a entenderem do que se trata",
  },
  {
    id: "maxMembers",
    title: "Número Máximo de Membros",
    subtitle: "Quantas pessoas podem participar desta assinatura?",
  },
  {
    id: "price",
    title: "Preço da Assinatura",
    subtitle: "Quanto cada membro irá pagar mensalmente?",
  },
]

export default function NovaAssinatura() {
  const navigate = useNavigate()
  const z = useZero<Schema>()
  const [currentStep, setCurrentStep] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [subscriptionId, setSubscriptionId] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxMembers: "",
    price: "",
  })

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < formSteps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/app/subscriptions/${subscriptionId}/join`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Junte-se à assinatura ${formData.name}`,
          text: `Venha participar da assinatura compartilhada ${formData.name}! Clique no link para entrar:`,
          url: shareUrl,
        })
      } catch (error) {
        console.error("Erro ao compartilhar:", error)
      }
    } else {
      // Fallback para copiar o link
      navigator.clipboard.writeText(shareUrl)
      // TODO: Adicionar toast de sucesso
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!formData.name?.trim()) {
      // TODO: Adicionar toast de erro
      return
    }

    const numericPrice = Number(formData.price.replace(/\D/g, "")) / 100

    try {
      const uuid = uuidv4()
      const data = {
        id: uuid,
        ownerId: z.userID || "",
        name: formData.name,
        description: formData.description,
        type: "private",
        maxMembers: Number(formData.maxMembers),
        princeInCents: numericPrice * 100,
        renewalDate: new Date().getTime(),
        status: "active",
      }
      console.log(data)
      await z.mutate.subscription.insert(data)
      setSubscriptionId(uuid)
      setShowSuccess(true)
    } catch (error) {
      console.error(error)
      // TODO: Adicionar toast de erro
    }
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
  }

  const renderFormField = () => {
    const currentField = formSteps[currentStep]

    return (
      <motion.div
        key={currentField.id}
        custom={currentStep}
        variants={slideVariants}
        initial="enter"
        animate="center"
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 35,
          mass: 0.8,
        }}
        className="space-y-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="space-y-2 "
        >
          <TypographyH2>{currentField.title}</TypographyH2>
          <p className="text-muted-foreground">{currentField.subtitle}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
          {currentField.id === "name" && (
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) => updateFormData("name", e.target.value)}
              placeholder="Digite o nome da assinatura"
              required
            />
          )}

          {currentField.id === "description" && (
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              placeholder="Digite uma descrição (opcional)"
            />
          )}

          {currentField.id === "maxMembers" && (
            <Input
              id="maxMembers"
              name="maxMembers"
              type="number"
              min="1"
              value={formData.maxMembers}
              onChange={(e) => updateFormData("maxMembers", e.target.value)}
              placeholder="Digite o número máximo de membros"
              required
            />
          )}

          {currentField.id === "price" && (
            <NumericFormat
              id="price"
              name="price"
              value={formData.price}
              onValueChange={(values) => updateFormData("price", values.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              thousandSeparator="."
              decimalSeparator=","
              prefix="R$ "
              decimalScale={2}
              fixedDecimalScale
              placeholder="Digite o preço da assinatura"
              required
            />
          )}
        </motion.div>
      </motion.div>
    )
  }

  if (showSuccess) {
    return (
      <AnimatePresence mode="wait">
        <SuccessScreen subscriptionName={formData.name} onShare={handleShare} onBackToHome={() => navigate("/app")} />
      </AnimatePresence>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-8">
        <TypographyH2>Nova Assinatura</TypographyH2>
      </div>

      <div className="max-w-xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 bg-muted rounded-full">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / formSteps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="mt-2 text-sm text-muted-foreground text-center">
            Passo {currentStep + 1} de {formSteps.length}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative overflow-hidden">
            <AnimatePresence initial={false} mode="wait" custom={currentStep}>
              {renderFormField()}
            </AnimatePresence>
          </div>

          <div className="flex gap-4 justify-end ">
            <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0}>
              Voltar
            </Button>

            {currentStep === formSteps.length - 1 ? (
              <Button type="submit">Criar Assinatura</Button>
            ) : (
              <Button
                type="button"
                onClick={nextStep}
                disabled={(currentStep === 0 && !formData.name) || (currentStep === 2 && !formData.maxMembers)}
              >
                Continuar
              </Button>
            )}
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
