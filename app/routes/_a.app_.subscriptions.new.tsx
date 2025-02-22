import { SuccessScreen } from "@/components/subscription/success-screen"
import { TemplateSelect } from "@/components/subscription/template-select"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { ControlledInput } from "@/components/ui/form/controlled-input"
import { TypographyH2 } from "@/components/ui/typography"
import type { InsertSubscriptionTemplate } from "@/db/drizzle-schema"
import type { Schema } from "@/db/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useZero } from "@rocicorp/zero/react"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import * as z from "zod"

const formSchema = z.object({
  templateId: z.string().nullable(),
  name: z.string().min(1, "O nome da assinatura é obrigatório"),
  description: z.string().optional(),
  maxMembers: z.string().min(1, "O número máximo de membros é obrigatório"),
  price: z.string().min(1, "O preço da assinatura é obrigatório"),
  dueDate: z
    .string()
    .min(1, "O dia de vencimento é obrigatório")
    .refine((val) => {
      const num = parseInt(val)
      return num >= 1 && num <= 31
    }, "O dia de vencimento deve estar entre 1 e 31"),
})

type FormValues = z.infer<typeof formSchema>

const formSteps = [
  {
    id: "template",
    title: "Tipo de Assinatura",
    subtitle: "Selecione um tipo de assinatura ou crie uma personalizada",
  },
  {
    id: "custom",
    title: "Detalhes da Assinatura",
    subtitle: "Defina o nome e a descrição da sua assinatura",
    showOnlyForCustom: true,
    fields: ["name", "description"],
  },
  {
    id: "payment",
    title: "Detalhes do Pagamento",
    subtitle: "Configure os valores e a data de vencimento",
    fields: ["maxMembers", "price", "dueDate"],
  },
]

export default function NovaAssinatura() {
  const navigate = useNavigate()
  const z = useZero<Schema>()
  const [currentStep, setCurrentStep] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [subscriptionId, setSubscriptionId] = useState("")
  const [selectedTemplateIsApproved, setSelectedTemplateIsApproved] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateId: null,
      name: "",
      description: "",
      maxMembers: "",
      price: "",
      dueDate: "",
    },
  })

  const nextStep = () => {
    if (currentStep < formSteps.length - 1) {
      // Se o template selecionado é aprovado e estamos no primeiro passo,
      // pule o passo de detalhes customizados
      if (currentStep === 0 && selectedTemplateIsApproved) {
        setCurrentStep(2)
        return
      }
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      // Se estamos no último passo e o template é aprovado,
      // volte para o primeiro passo
      if (currentStep === 2 && selectedTemplateIsApproved) {
        setCurrentStep(0)
        return
      }
      setCurrentStep((prev) => prev - 1)
    }
  }

  async function onSubmit(values: FormValues) {
    const numericPrice = Number(values.price.replace(/\D/g, "")) / 100
    const today = new Date()
    const dueDay = parseInt(values.dueDate)
    let dueDate = new Date(today.getFullYear(), today.getMonth(), dueDay)

    // Se o dia de vencimento já passou este mês, define para o próximo mês
    if (dueDate.getTime() < today.getTime()) {
      dueDate = new Date(today.getFullYear(), today.getMonth() + 1, dueDay)
    }

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
        princeInCents: numericPrice * 100,
        renewalDate: dueDate.getTime(),
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
          subscriptionName={form.getValues("name")}
          subscriptionId={subscriptionId}
          name={form.getValues("name")}
          onBackToHome={() => navigate("/app")}
        />
      </AnimatePresence>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container py-8 flex-1 flex items-center justify-center">
        <div className="w-full max-w-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="relative overflow-hidden min-h-[200px]">
                <AnimatePresence initial={false} mode="wait" custom={currentStep}>
                  <NovaAssinaturaFormField
                    form={form}
                    currentStep={currentStep}
                    onTemplateSelect={(template) => {
                      setSelectedTemplateIsApproved(template?.approved ?? false)
                    }}
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
                      (currentStep === 0 && !form.watch("templateId")) ||
                      (!selectedTemplateIsApproved && currentStep === 1 && !form.watch("name"))
                    }
                  >
                    Continuar
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}

const NovaAssinaturaFormField = (props: {
  form: ReturnType<typeof useForm<FormValues>>
  currentStep: number
  onTemplateSelect: (template: InsertSubscriptionTemplate | null) => void
}) => {
  const currentField = formSteps[props.currentStep]
  const form = props.form

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

  const handleTemplateSelect = (template: InsertSubscriptionTemplate | null) => {
    if (!template) {
      form.setValue("templateId", null)
      form.setValue("name", "")
      form.setValue("description", "")
      form.setValue("maxMembers", "")
      form.setValue("price", "")
      props.onTemplateSelect(null)
      return
    }
    form.setValue("templateId", template.id)
    form.setValue("name", template.name)
    form.setValue("description", template.description ?? "")
    form.setValue("maxMembers", template.recommendedMaxMembers.toString())
    form.setValue("price", (template.recommendedPriceInCents / 100).toFixed(2))
    props.onTemplateSelect(template)
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
          <FormField
            control={props.form.control}
            name="templateId"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <TemplateSelect value={field.value} onSelect={handleTemplateSelect} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {currentField.id === "custom" && (
          <div className="space-y-4">
            <ControlledInput
              name="name"
              control={props.form.control}
              placeholder="Ex: Curso de Culinária, Tv por assinatura, etc."
            />

            <ControlledInput
              name="description"
              control={props.form.control}
              placeholder="Digite uma descrição (opcional)"
            />
          </div>
        )}

        {currentField.id === "payment" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <ControlledInput
                name="maxMembers"
                control={props.form.control}
                type="number"
                min={1}
                placeholder="Quantidade de pessoas"
                label="Quantidade de pessoas"
              />

              <ControlledInput
                name="price"
                control={props.form.control}
                numeric
                thousandSeparator="."
                decimalSeparator=","
                prefix="R$ "
                decimalScale={2}
                fixedDecimalScale
                placeholder="Valor por pessoa"
                label="Valor por pessoa"
              />
            </div>

            <ControlledInput
              name="dueDate"
              control={props.form.control}
              type="number"
              min={1}
              max={31}
              placeholder="Dia do vencimento (1-31)"
              label="Dia do vencimento"
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

const NovaAssinaturaProgressBar = ({ currentStep }: { currentStep: number }) => {
  const progress = ((currentStep + 1) / formSteps.length) * 100

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
