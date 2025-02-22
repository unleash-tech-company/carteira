import { SuccessScreen } from "@/components/subscription/success-screen"
import { TemplateSelect } from "@/components/subscription/template-select"
import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { ControlledInput } from "@/components/ui/form/controlled-input"
import { TypographyH2 } from "@/components/ui/typography"
import type { Schema } from "@/db/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useZero } from "@rocicorp/zero/react"
import { AnimatePresence, motion } from "framer-motion"
import { Users } from "lucide-react"
import { useState } from "react"
import { FormProvider, useForm, useFormContext } from "react-hook-form"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { match } from "ts-pattern"
import { v4 as uuidv4 } from "uuid"
import * as z from "zod"

export default function NovaAssinatura() {
  const navigate = useNavigate()
  const z = useZero<Schema>()
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.SELECT_TEMPLATE)
  const [showSuccess, setShowSuccess] = useState(false)
  const [subscriptionId, setSubscriptionId] = useState("")
  const [selectedTemplateIsApproved, setSelectedTemplateIsApproved] = useState(false)

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateId: null,
      name: "",
      description: "",
      maxMembers: "",
      price: "",
      dueDate: "5",
    },
  })

  const nextStep = () => {
    const config = formStepConfig[currentStep]
    if (config.nextStep) {
      const nextStep = config.nextStep(selectedTemplateIsApproved)
      setCurrentStep(nextStep)
    }
  }

  const prevStep = () => {
    const config = formStepConfig[currentStep]
    if (config.prevStep) {
      const prevStep = config.prevStep(selectedTemplateIsApproved)
      setCurrentStep(prevStep)
    }
  }

  async function onSubmit(values: FormValues) {
    const totalPriceInCents = Number(values.price.replace(/\D/g, ""))
    const dueDay = parseInt(values.dueDate)

    try {
      const uuid = uuidv4()
      const data = {
        id: uuid,
        ownerId: z.userID || "",
        templateId: values.templateId,
        name: values.name,
        description: values.description,
        type: "private",
        maxMembers: Number(values.maxMembers),
        princeInCents: totalPriceInCents,
        renewalDay: dueDay,
        status: "active",
      }
      await z.mutate.subscription.insert(data)
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
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
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

              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={!formStepConfig[currentStep].prevStep}
                >
                  Voltar
                </Button>

                {currentStep === FormStep.PAYMENT_DETAILS ? (
                  <Button type="submit">Criar Assinatura</Button>
                ) : (
                  <Button type="button" onClick={nextStep}>
                    Continuar
                  </Button>
                )}
              </div>
            </form>
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

const formSchema = z.object({
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

type FormValues = z.infer<typeof formSchema>

interface SelectTemplateStepProps {
  setSelectedTemplateIsApproved: (value: boolean) => void
}

function SelectTemplateStep({ setSelectedTemplateIsApproved }: SelectTemplateStepProps) {
  const form = useFormContext<FormValues>()

  return (
    <FormField
      control={form.control}
      name="templateId"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <TemplateSelect
              value={field.value}
              onSelect={(template) => {
                if (!template) {
                  form.setValue("templateId", null)
                  form.setValue("name", "")
                  form.setValue("description", "")
                  form.setValue("maxMembers", "")
                  form.setValue("price", "")
                  setSelectedTemplateIsApproved(false)
                  return
                }
                form.setValue("templateId", template.id)
                form.setValue("name", template.name)
                form.setValue("description", template.description ?? "")
                form.setValue("maxMembers", template.recommendedMaxMembers.toString())
                const totalPrice = template.recommendedPriceInCents * template.recommendedMaxMembers
                form.setValue("price", (totalPrice / 100).toFixed(2))
                setSelectedTemplateIsApproved(template.approved ?? false)
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function CustomDetailsStep() {
  const form = useFormContext<FormValues>()

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
  const form = useFormContext<FormValues>()

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
