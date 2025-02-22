import { SuccessScreen } from "@/components/subscription/success-screen"
import { TemplateSelect } from "@/components/subscription/template-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TypographyH2 } from "@/components/ui/typography"
import type { Schema } from "@/db/schema"
import { useZero } from "@rocicorp/zero/react"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import { NumericFormat } from "react-number-format"
import { useNavigate } from "react-router"
import { v4 as uuidv4 } from "uuid"

const formSteps = [
  {
    id: "template",
    title: "Tipo de Assinatura",
    subtitle: "Selecione um tipo de assinatura ou crie uma personalizada",
  },
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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxMembers: "",
    price: "",
  })

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleTemplateSelect = (
    template: {
      id: string
      name: string
      description: string | null
      recommendedMaxMembers: number
      recommendedPriceInCents: number
    } | null
  ) => {
    setSelectedTemplateId(template?.id ?? null)
    if (template) {
      setFormData({
        name: template.name,
        description: template.description ?? "",
        maxMembers: template.recommendedMaxMembers.toString(),
        price: (template.recommendedPriceInCents / 100).toFixed(2),
      })
    } else {
      setFormData({
        name: "",
        description: "",
        maxMembers: "",
        price: "",
      })
    }
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
        templateId: selectedTemplateId,
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

  if (showSuccess) {
    return (
      <AnimatePresence mode="wait">
        <SuccessScreen
          subscriptionName={formData.name}
          subscriptionId={subscriptionId}
          name={formData.name}
          onBackToHome={() => navigate("/app")}
        />
      </AnimatePresence>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container py-8 flex-1 flex items-center justify-center">
        <div className="w-full max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative overflow-hidden min-h-[200px]">
              <AnimatePresence initial={false} mode="wait" custom={currentStep}>
                <NovaAssinaturaFormField
                  currentStep={currentStep}
                  selectedTemplateId={selectedTemplateId}
                  formData={formData}
                  handleTemplateSelect={handleTemplateSelect}
                  updateFormData={updateFormData}
                />
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
                  disabled={
                    (currentStep === 0 && !selectedTemplateId) ||
                    (currentStep === 1 && !formData.name) ||
                    (currentStep === 3 && !formData.maxMembers)
                  }
                >
                  Continuar
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const NovaAssinaturaFormField = (props: {
  currentStep: number
  selectedTemplateId: string | null
  formData: { name: string; description: string; maxMembers: string; price: string }
  handleTemplateSelect: (
    template: {
      id: string
      name: string
      description: string | null
      recommendedMaxMembers: number
      recommendedPriceInCents: number
    } | null
  ) => void
  updateFormData: (field: string, value: string) => void
}) => {
  const currentField = formSteps[props.currentStep]

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

  return (
    <motion.div
      key={currentField.id}
      custom={props.currentStep}
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
        <NovaAssinaturaProgressBar currentStep={props.currentStep} />
        <p className="text-muted-foreground">{currentField.subtitle}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
        {currentField.id === "template" && (
          <TemplateSelect value={props.selectedTemplateId} onSelect={props.handleTemplateSelect} />
        )}

        {currentField.id === "name" && (
          <Input
            id="name"
            name="name"
            value={props.formData.name}
            onChange={(e) => props.updateFormData("name", e.target.value)}
            placeholder="Ex: Curso de Culinária, Tv por assinatura, etc."
            required
          />
        )}

        {currentField.id === "description" && (
          <Input
            id="description"
            name="description"
            value={props.formData.description}
            onChange={(e) => props.updateFormData("description", e.target.value)}
            placeholder="Digite uma descrição (opcional)"
          />
        )}

        {currentField.id === "maxMembers" && (
          <Input
            id="maxMembers"
            name="maxMembers"
            type="number"
            min="1"
            value={props.formData.maxMembers}
            onChange={(e) => props.updateFormData("maxMembers", e.target.value)}
            placeholder="Digite o número máximo de membros"
            required
          />
        )}

        {currentField.id === "price" && (
          <NumericFormat
            id="price"
            name="price"
            value={props.formData.price}
            onValueChange={(values) => props.updateFormData("price", values.value)}
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

const NovaAssinaturaProgressBar = (props: { currentStep: number }) => {
  return (
    <div className="mb-8">
      <div className="h-2 bg-muted rounded-full">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${((props.currentStep + 1) / formSteps.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="mt-2 text-sm text-muted-foreground text-end">
        Passo {props.currentStep + 1} de {formSteps.length}
      </div>
    </div>
  )
}
