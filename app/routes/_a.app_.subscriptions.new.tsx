import { SuccessScreen } from "@/components/subscription/success-screen"
import { Button } from "@/components/ui/button"
import { ControlledInput } from "@/components/ui/form/controlled-input"
import { ControlledSelect, type SelectOption } from "@/components/ui/form/controlled-select"
import { TypographyH2 } from "@/components/ui/typography"
import type { Schema, SubscriptionTemplate } from "@/db/schema"
import { useSubscriptionTemplates } from "@/hooks/use-subscription-templates"
import { createSubscription } from "@/service/subscriptions"
import { zodResolver } from "@hookform/resolvers/zod"
import { useZero } from "@rocicorp/zero/react"
import { AnimatePresence, motion } from "framer-motion"
import { Users } from "lucide-react"
import { useState } from "react"
import { FormProvider, useForm, useFormContext } from "react-hook-form"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { match } from "ts-pattern"
import * as z from "zod"

const newSubscriptionForm = z.object({
  templateId: z.string().nullable(),
  name: z.string().min(1, "O nome da assinatura é obrigatório"),
  description: z.string().optional(),
  maxMembers: z.string().min(1, "O número máximo de membros é obrigatório"),
  price: z.string().min(1, "O preço da assinatura é obrigatório"),
  dueDate: z
    .string()
    .min(1, "O dia de vencimento é obrigatório")
    .default("5")
    .refine((val) => {
      const num = parseInt(val)
      return num >= 1 && num <= 31
    }, "O dia de vencimento deve estar entre 1 e 31"),
})

export type FormNewSubscription = z.infer<typeof newSubscriptionForm>
export default function NovaAssinatura() {
  const navigate = useNavigate()
  const z = useZero<Schema>()
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.SELECT_TEMPLATE)
  const [showSuccess, setShowSuccess] = useState(false)
  const [subscriptionId, setSubscriptionId] = useState("")
  const [selectedTemplateIsApproved, setSelectedTemplateIsApproved] = useState(false)

  const methods = useForm<FormNewSubscription>({
    resolver: zodResolver(newSubscriptionForm),
    defaultValues: {
      templateId: null,
      name: "",
      description: "",
      maxMembers: "",
      price: "",
      dueDate: "5",
    },
  })

  const nextStep = (values: FormNewSubscription) => {
    const config = formStepConfig[currentStep]
    if (config.nextStep) {
      const nextStep = config.nextStep(selectedTemplateIsApproved)
      setCurrentStep(nextStep)
      return
    }

    onSubmit(values)
  }

  const prevStep = () => {
    const config = formStepConfig[currentStep]
    if (config.prevStep) {
      const prevStep = config.prevStep(selectedTemplateIsApproved)
      setCurrentStep(prevStep)
    }
  }

  async function onSubmit(values: FormNewSubscription) {
    try {
      const uuid = await createSubscription(z, values)
      if (!uuid) {
        throw new Error("Erro ao criar assinatura")
      }
      setSubscriptionId(uuid)
      setShowSuccess(true)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao criar assinatura", {
        description: "Ocorreu um erro ao criar sua assinatura. Por favor, tente novamente.",
      })
    }
  }

  if (showSuccess) {
    return (
      <AnimatePresence mode="wait">
        <SuccessScreen
          subscriptionName={methods.getValues("name")}
          subscriptionId={subscriptionId}
          name={methods.getValues("name")}
          onBackToHome={() => navigate("/app")}
        />
      </AnimatePresence>
    )
  }

  const currentConfig = formStepConfig[currentStep]

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container py-8 flex-1 flex items-center justify-center">
        <div className="w-full max-w-xl">
          <FormProvider {...methods}>
            <div className="relative overflow-hidden min-h-[200px]">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={currentStep}
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
                    className="space-y-2"
                  >
                    <TypographyH2>{currentConfig.title}</TypographyH2>
                    <NovaAssinaturaProgressBar currentStep={Object.values(FormStep).indexOf(currentStep)} />
                    <p className="text-muted-foreground">{currentConfig.subtitle}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {match(currentStep)
                      .with(FormStep.SELECT_TEMPLATE, () => (
                        <SelectTemplateStep setSelectedTemplateIsApproved={setSelectedTemplateIsApproved} />
                      ))
                      .with(FormStep.CUSTOM_DETAILS, () => <CustomDetailsStep />)
                      .with(FormStep.PAYMENT_DETAILS, () => <PaymentDetailsStep />)
                      .exhaustive()}
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex gap-4 justify-end mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={!formStepConfig[currentStep].prevStep}
              >
                Voltar
              </Button>

              <Button type="button" onClick={methods.handleSubmit(nextStep, console.log)}>
                {match(currentStep)
                  .with(FormStep.PAYMENT_DETAILS, () => "Criar Assinatura")
                  .otherwise(() => "Continuar")}
              </Button>
            </div>
          </FormProvider>
        </div>
      </div>
    </div>
  )
}

enum FormStep {
  SELECT_TEMPLATE = "SELECT_TEMPLATE",
  CUSTOM_DETAILS = "CUSTOM_DETAILS",
  PAYMENT_DETAILS = "PAYMENT_DETAILS",
}

type StepConfig = {
  title: string
  subtitle: string
  nextStep: ((isApproved: boolean) => FormStep) | null
  prevStep: ((isApproved: boolean) => FormStep) | null
}

const formStepConfig: Record<FormStep, StepConfig> = {
  [FormStep.SELECT_TEMPLATE]: {
    title: "Tipo de Assinatura",
    subtitle: "Selecione um tipo de assinatura ou crie uma personalizada",
    nextStep: () => FormStep.CUSTOM_DETAILS,
    prevStep: null,
  },
  [FormStep.CUSTOM_DETAILS]: {
    title: "Detalhes da Assinatura",
    subtitle: "Defina o nome e a descrição da sua assinatura",
    nextStep: () => FormStep.PAYMENT_DETAILS,
    prevStep: () => FormStep.SELECT_TEMPLATE,
  },
  [FormStep.PAYMENT_DETAILS]: {
    title: "Detalhes do Pagamento",
    subtitle: "Configure os valores e a data de vencimento",
    nextStep: null,
    prevStep: (isApproved: boolean) => (isApproved ? FormStep.SELECT_TEMPLATE : FormStep.CUSTOM_DETAILS),
  },
} as const

interface SelectTemplateStepProps {
  setSelectedTemplateIsApproved: (value: boolean) => void
}

function SelectTemplateStep({ setSelectedTemplateIsApproved }: SelectTemplateStepProps) {
  const form = useFormContext<FormNewSubscription>()
  const { templates, isLoading } = useSubscriptionTemplates()
  const [inputValue, setInputValue] = useState("")

  const handleSelect = (selectedValue: SubscriptionTemplate | null) => {
    const matchedTemplate = templates?.find((template) => template.id === selectedValue?.id)

    if (matchedTemplate) {
      form.setValue("templateId", matchedTemplate.id)
      form.setValue("name", matchedTemplate.name)
      form.setValue("description", matchedTemplate.description ?? "")
      form.setValue("maxMembers", matchedTemplate.recommendedMaxMembers.toString())
      const totalPrice = matchedTemplate.recommendedPriceInCents * matchedTemplate.recommendedMaxMembers
      form.setValue("price", (totalPrice / 100).toFixed(2))
      setSelectedTemplateIsApproved(matchedTemplate.approved ?? false)
    } else if (selectedValue === null) {
      form.setValue("templateId", `custom-${Date.now()}`)
      form.setValue("name", inputValue || "")
      form.setValue("description", "")
      form.setValue("maxMembers", "1")
      form.setValue("price", "")
      setSelectedTemplateIsApproved(false)
    }
  }

  const options: SelectOption<SubscriptionTemplate | null>[] = [
    ...(templates?.map((template) => ({
      value: template,
      label: template.name,
      description: template.description ?? undefined,
    })) ?? []),
    {
      value: null,
      label: "Criar assinatura personalizada",
      description: "Defina suas próprias configurações de assinatura",
    },
  ]

  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(inputValue.toLowerCase()))

  return (
    <ControlledSelect
      name="selectedTemplate"
      options={filteredOptions}
      onSelect={handleSelect}
      eq={(a, b) => a?.id === b?.id}
      placeholder={isLoading ? "Carregando templates..." : "Selecione um template..."}
      searchPlaceholder="Buscar ou criar template..."
      required
      emptyMessage={
        inputValue
          ? `Criar "${inputValue}"\nPressione enter para criar um template personalizado`
          : "Nenhum template encontrado."
      }
      onSearch={setInputValue}
      disabled={isLoading}
    />
  )
}

function CustomDetailsStep() {
  const form = useFormContext<FormNewSubscription>()

  return (
    <div className="space-y-4">
      <ControlledInput
        name="name"
        placeholder="Ex: Curso de Culinária, Tv por assinatura, etc."
        label="Nome da assinatura"
      />

      <ControlledInput name="description" placeholder="Digite uma descrição (opcional)" label="Descrição" />
    </div>
  )
}

function PaymentDetailsStep() {
  const form = useFormContext<FormNewSubscription>()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <ControlledInput
          name="maxMembers"
          type="number"
          min={1}
          placeholder="Quantidade de pessoas"
          label="Quantidade de pessoas que vão dividir"
        />

        <ControlledInput
          name="price"
          numeric
          thousandSeparator="."
          decimalSeparator=","
          prefix="R$ "
          decimalScale={2}
          fixedDecimalScale
          placeholder="Valor total da assinatura"
          label="Valor total da assinatura"
        />
      </div>

      <ControlledInput
        name="dueDate"
        type="number"
        min={1}
        max={31}
        placeholder="Dia do vencimento (1-31)"
        label="Dia do vencimento do pagamento"
      />

      {form.watch("maxMembers") && form.watch("price") && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-muted p-4 rounded-lg space-y-2"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Cada pessoa vai pagar:
            </span>
            <span className="font-medium text-primary">
              R${" "}
              {(Number(form.watch("price").replace(/\D/g, "")) / 100 / Number(form.watch("maxMembers"))).toLocaleString(
                "pt-BR",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}

const slideVariants = {
  enter: {
    x: 1000,
    opacity: 0,
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
}

const NovaAssinaturaProgressBar = ({ currentStep }: { currentStep: number }) => {
  const progress = ((currentStep + 1) / Object.keys(FormStep).length) * 100

  return (
    <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  )
}
