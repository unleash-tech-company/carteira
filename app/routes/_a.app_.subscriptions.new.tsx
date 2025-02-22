import { SuccessScreen } from "@/components/subscription/success-screen"
import { TemplateSelect } from "@/components/subscription/template-select"
import { TypeSelect } from "@/components/subscription/type-select"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { ControlledInput } from "@/components/ui/form/controlled-input"
import { TypographyH2 } from "@/components/ui/typography"
import type { SubscriptionTemplate } from "@/db/drizzle-schema"
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
  type: z.string().min(1, "O tipo da assinatura é obrigatório"),
  name: z.string().min(1, "O nome da assinatura é obrigatório"),
  description: z.string().optional(),
  maxMembers: z.string().min(1, "O número máximo de membros é obrigatório"),
  price: z.string().min(1, "O preço da assinatura é obrigatório"),
})

type FormValues = z.infer<typeof formSchema>

const formSteps = [
  {
    id: "template",
    title: "Tipo de Assinatura",
    subtitle: "Selecione um tipo de assinatura ou crie uma personalizada",
  },
  {
    id: "type",
    title: "Categoria",
    subtitle: "Selecione a categoria da sua assinatura",
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateId: null,
      type: "",
      name: "",
      description: "",
      maxMembers: "",
      price: "",
    },
  })

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

  async function onSubmit(values: FormValues) {
    const numericPrice = Number(values.price.replace(/\D/g, "")) / 100

    try {
      const uuid = uuidv4()
      const data = {
        id: uuid,
        ownerId: z.userID || "",
        templateId: values.templateId,
        name: values.name,
        description: values.description,
        type: values.type,
        maxMembers: Number(values.maxMembers),
        princeInCents: numericPrice * 100,
        renewalDate: new Date().getTime(),
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

  console.log(form.watch("templateId"), form.watch("name"), form.watch("maxMembers"))

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container py-8 flex-1 flex items-center justify-center">
        <div className="w-full max-w-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="relative overflow-hidden min-h-[200px]">
                <AnimatePresence initial={false} mode="wait" custom={currentStep}>
                  <NovaAssinaturaFormField form={form} currentStep={currentStep} />
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
                      (currentStep === 1 && !form.watch("type")) ||
                      (currentStep === 2 && !form.watch("name")) ||
                      (currentStep === 4 && !form.watch("maxMembers"))
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

const NovaAssinaturaFormField = (props: { form: ReturnType<typeof useForm<FormValues>>; currentStep: number }) => {
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

  const handleTemplateSelect = (
    template: Pick<
      SubscriptionTemplate,
      "id" | "name" | "description" | "recommendedMaxMembers" | "recommendedPriceInCents"
    > | null
  ) => {
    if (!template) {
      form.setValue("templateId", null)
      form.setValue("name", "")
      form.setValue("description", "")
      form.setValue("maxMembers", "")
      form.setValue("price", "")
      return
    }
    form.setValue("templateId", template.id)
    form.setValue("name", template.name)
    form.setValue("description", template.description ?? "")
    form.setValue("maxMembers", template.recommendedMaxMembers.toString())
    form.setValue("price", (template.recommendedPriceInCents / 100).toFixed(2))
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

        {currentField.id === "type" && (
          <FormField
            control={props.form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <TypeSelect value={field.value} onSelect={(value) => field.onChange(value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {currentField.id === "name" && (
          <ControlledInput
            name="name"
            control={props.form.control}
            placeholder="Ex: Curso de Culinária, Tv por assinatura, etc."
          />
        )}

        {currentField.id === "description" && (
          <ControlledInput
            name="description"
            control={props.form.control}
            placeholder="Digite uma descrição (opcional)"
          />
        )}

        {currentField.id === "maxMembers" && (
          <ControlledInput
            name="maxMembers"
            control={props.form.control}
            type="number"
            min={1}
            placeholder="Digite o número máximo de membros"
          />
        )}

        {currentField.id === "price" && (
          <ControlledInput
            name="price"
            control={props.form.control}
            numeric
            thousandSeparator="."
            decimalSeparator=","
            prefix="R$ "
            decimalScale={2}
            fixedDecimalScale
            placeholder="Digite o preço da assinatura"
          />
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
