import { SuccessScreen } from "@/components/subscription/success-screen"
import { Button } from "@/components/ui/button"
import { ControlledInput } from "@/components/ui/form/controlled-input"
import { ControlledSelect, type SelectOption } from "@/components/ui/form/controlled-select"
import { ControlledToggleGroup, type ToggleOption } from "@/components/ui/form/controlled-toggle-group"
import { TypographyH2 } from "@/components/ui/typography"
import { querySubscriptionTemplates } from "@/hooks/use-subscription-templates"
import { formatCurrency } from "@/lib/currency"
import { SubscriptionService } from "@/service/subscriptions"
import { subscriptionInsertSchema, type Schema, type SubscriptionTemplate } from "@carteira/db"
import { useUser } from "@clerk/react-router"
import { useQuery, useZero } from "@rocicorp/zero/react"
import { AnimatePresence, motion } from "framer-motion"
import { KeyRound, Link, Users } from "lucide-react"
import { useState } from "react"
import { FormProvider, useForm, useFormContext } from "react-hook-form"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { match } from "ts-pattern"
import * as z from "zod"

export type FormNewSubscription = { local: { hasPassword: boolean } } & SubscriptionService.CreateNewSubscriptionParams
export default function NovaAssinatura() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.SELECT_TEMPLATE)
  const [subscriptionId, setSubscriptionId] = useState("")

  const methods = useForm<FormNewSubscription>({
    defaultValues: {
      subscription: {
        id: "",
        ownerId: user?.id ?? "",
        name: "",
        description: "",
        renewalDay: 5,
        maxMembers: 1,
        status: "active",
        type: "private",
      },
      subscriptionAccount: {
        id: "",
        subscriptionId: "",
        accountUserName: "",
        encryptedAccountPassword: "",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      subscriptionTemplate: {
        id: "",
        name: "",
        description: "",
        type: "",
        category: "",
      },
    },
  })

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
                  {currentStep !== FormStep.SUCCESS && (
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
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {match(currentStep)
                      .with(FormStep.SELECT_TEMPLATE, () => (
                        <SelectTemplateStep currentStep={currentStep} setCurrentStep={setCurrentStep} />
                      ))
                      .with(FormStep.CUSTOM_DETAILS, () => (
                        <SubscriptionDetails currentStep={currentStep} setCurrentStep={setCurrentStep} />
                      ))
                      .with(FormStep.PAYMENT_DETAILS, () => (
                        <PaymentDetailsStep currentStep={currentStep} setCurrentStep={setCurrentStep} />
                      ))
                      .with(FormStep.PASSWORD, () => (
                        <PasswordStep
                          currentStep={currentStep}
                          setCurrentStep={setCurrentStep}
                          setSubscriptionId={setSubscriptionId}
                        />
                      ))
                      .with(FormStep.SUCCESS, () => (
                        <SuccessScreen
                          subscriptionName={methods.getValues("subscription.name")}
                          subscriptionId={subscriptionId}
                          name={methods.getValues("subscription.name")}
                          onBackToHome={() => navigate("/app")}
                        />
                      ))
                      .exhaustive()}
                  </motion.div>
                </motion.div>
              </AnimatePresence>
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
  PASSWORD = "PASSWORD",
  SUCCESS = "SUCCESS",
}

type StepConfig = {
  title: string
  subtitle: string
}

const formStepConfig: Record<FormStep, StepConfig> = {
  [FormStep.SELECT_TEMPLATE]: {
    title: "Tipo de Assinatura",
    subtitle: "Selecione um tipo de assinatura ou crie uma personalizada",
  },
  [FormStep.CUSTOM_DETAILS]: {
    title: "Detalhes da Assinatura",
    subtitle: "Defina o nome e a descrição da sua assinatura",
  },
  [FormStep.PAYMENT_DETAILS]: {
    title: "Detalhes do Pagamento",
    subtitle: "Configure os valores e a data de vencimento",
  },
  [FormStep.PASSWORD]: {
    title: "Tipo de Acesso",
    subtitle: "Defina se o serviço requer senha para funcionar",
  },
  [FormStep.SUCCESS]: {
    title: "Assinatura Criada com Sucesso",
    subtitle: "Agora você pode compartilhar a assinatura com seus amigos",
  },
} as const

function SelectTemplateStep(p: { currentStep: FormStep; setCurrentStep: (step: FormStep) => void }) {
  const form = useFormContext<FormNewSubscription>()
  const zero = useZero<Schema>()
  const [inputValue, setInputValue] = useState("")
  const selectTemplatesQuery = querySubscriptionTemplates(zero).where("name", "ILIKE", `%${inputValue}%`)
  const navigate = useNavigate()

  const prevStep = () => {
    navigate(-1)
  }

  const onSubmit = (values: FormNewSubscription) => {
    p.setCurrentStep(FormStep.CUSTOM_DETAILS)
  }

  const [templates, optionsTemplates] = useQuery(selectTemplatesQuery)
  const isLoadingTemplates = optionsTemplates.type !== "complete"

  const handleSelect = (selectedValue: SubscriptionTemplate | null) => {
    const matchedTemplate = templates?.find((template) => template.id === selectedValue?.id)

    if (matchedTemplate) {
      form.setValue("subscriptionTemplate.id", matchedTemplate.id)
      form.setValue("subscription.name", matchedTemplate.name)
      form.setValue("subscription.description", matchedTemplate.description ?? "")
      form.setValue("subscription.maxMembers", matchedTemplate.recommendedMaxMembers)
      const totalPrice = matchedTemplate.recommendedPriceInCents * matchedTemplate.recommendedMaxMembers
      form.setValue("subscription.princeInCents", totalPrice)
    } else if (selectedValue) {
      form.setValue("subscriptionTemplate.id", selectedValue.id)
      form.setValue("subscription.name", selectedValue.name)
      form.setValue("subscription.description", "")
      form.setValue("subscription.maxMembers", 1)
      form.setValue("subscription.princeInCents", 0)
    }
  }

  const options: SelectOption<SubscriptionTemplate>[] =
    templates?.map((template) => ({
      value: template,
      label: template.name,
      description: template.description ?? undefined,
    })) ?? []

  const handleCreate = (value: string): SelectOption<SubscriptionTemplate> => {
    const customTemplate: SubscriptionTemplate = {
      id: `custom-${Date.now()}`,
      name: value,
      description: "",
      type: "",
      category: "",
      provider: "",
      planName: "",
      recommendedMaxMembers: 1,
      recommendedPriceInCents: 0,
      approved: false,
      createdAt: Date.now(),
      updatedAt: null,
    }

    return {
      value: customTemplate,
      label: customTemplate.name,
      description: "",
    }
  }

  return (
    <>
      <ControlledSelect<FormNewSubscription, SubscriptionTemplate>
        name="subscriptionTemplate"
        options={options}
        onSelect={handleSelect}
        eq={(a, b) => a?.id === b?.id}
        placeholder={isLoadingTemplates ? "Carregando templates..." : "Selecione um template..."}
        searchPlaceholder="Buscar ou criar template..."
        schema={z.object({
          id: z.string(),
          name: z.string().min(1, "O nome do template é obrigatório"),
        })}
        emptyMessage="Nenhum template encontrado."
        onSearch={setInputValue}
        disabled={isLoadingTemplates}
        onCreate={handleCreate}
        createOptionLabel={(value) => `Criar "${value}"`}
      />
      <div className="flex gap-4 justify-end mt-4">
        <Button type="button" variant="outline" onClick={prevStep}>
          Voltar
        </Button>

        <Button type="button" onClick={form.handleSubmit(onSubmit)}>
          Continuar
        </Button>
      </div>
    </>
  )
}

function SubscriptionDetails(p: { currentStep: FormStep; setCurrentStep: (step: FormStep) => void }) {
  const methods = useFormContext<FormNewSubscription>()
  const prevStep = () => {
    p.setCurrentStep(FormStep.SELECT_TEMPLATE)
  }
  const onSubmit = (values: FormNewSubscription) => {
    p.setCurrentStep(FormStep.PAYMENT_DETAILS)
  }
  return (
    <>
      <div className="space-y-4">
        <ControlledInput<FormNewSubscription>
          name="subscription.name"
          schema={z.string().min(1, "O nome da assinatura é obrigatório")}
          placeholder="Ex: Curso de Culinária, Tv por assinatura, etc."
          label="Nome da assinatura"
        />

        <ControlledInput<FormNewSubscription>
          name="subscription.description"
          schema={z.string().optional()}
          placeholder="Digite uma descrição (opcional)"
          label="Descrição"
        />
      </div>
      <div className="flex gap-4 justify-end mt-4">
        <Button type="button" variant="outline" onClick={prevStep}>
          Voltar
        </Button>

        <Button type="button" onClick={methods.handleSubmit(onSubmit)}>
          {match(p.currentStep)
            .with(FormStep.PASSWORD, () => "Criar Assinatura")
            .otherwise(() => "Continuar")}
        </Button>
      </div>
    </>
  )
}

function PaymentDetailsStep(p: { currentStep: FormStep; setCurrentStep: (step: FormStep) => void }) {
  const form = useFormContext<FormNewSubscription>()
  const prevStep = () => {
    p.setCurrentStep(FormStep.CUSTOM_DETAILS)
  }
  const onSubmit = (values: FormNewSubscription) => {
    p.setCurrentStep(FormStep.PASSWORD)
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <ControlledInput<FormNewSubscription>
            name="subscription.maxMembers"
            schema={z.coerce.number().min(1, "A quantidade de pessoas é obrigatória")}
            type="number"
            min={1}
            placeholder="Quantidade de pessoas"
            label="Quantidade de pessoas que vão dividir"
          />

          <ControlledInput<FormNewSubscription>
            name="subscription.princeInCents"
            numeric
            thousandSeparator="."
            decimalSeparator=","
            prefix="R$ "
            decimalScale={2}
            schema={subscriptionInsertSchema.shape.createdAt}
            fixedDecimalScale
            placeholder="Valor total da assinatura"
            label="Valor total da assinatura"
          />
        </div>

        <ControlledInput<FormNewSubscription>
          name="subscription.renewalDay"
          schema={z.coerce
            .number()
            .min(1, "O dia de vencimento é obrigatório")
            .max(31, "O dia de vencimento deve estar entre 1 e 31")}
          type="number"
          min={1}
          max={31}
          placeholder="Dia do vencimento (1-31)"
          label="Dia do vencimento do pagamento"
        />

        {form.watch("subscription.maxMembers") && form.watch("subscription.princeInCents") && (
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
                {formatCurrency({
                  valueInCents: form.watch("subscription.princeInCents"),
                })}
              </span>
            </div>
          </motion.div>
        )}
      </div>
      <div className="flex gap-4 justify-end mt-4">
        <Button type="button" variant="outline" onClick={prevStep}>
          Voltar
        </Button>

        <Button type="button" onClick={form.handleSubmit(onSubmit)}>
          {match(p.currentStep)
            .with(FormStep.PASSWORD, () => "Criar Assinatura")
            .otherwise(() => "Continuar")}
        </Button>
      </div>
    </>
  )
}

function PasswordStep(p: {
  currentStep: FormStep
  setCurrentStep: (step: FormStep) => void
  setSubscriptionId: (subscriptionId: string) => void
}) {
  const { user } = useUser()
  const zero = useZero<Schema>()
  const form = useFormContext<FormNewSubscription>()
  const prevStep = () => {
    p.setCurrentStep(FormStep.PAYMENT_DETAILS)
  }
  async function onSubmit(values: FormNewSubscription) {
    const [result, err] = await SubscriptionService.createSubscription(zero, user?.id ?? "", values)

    if (err) {
      console.error(err)
      toast.error("Erro ao criar assinatura", {
        description: "Ocorreu um erro ao criar sua assinatura. Por favor, tente novamente.",
      })
      return
    }

    p.setSubscriptionId(result.subscriptionId)
    p.setCurrentStep(FormStep.SUCCESS)
  }

  const options: ToggleOption<boolean>[] = [
    {
      value: true,
      label: "Requer senha de acesso",
      description: "Para serviços que precisam de login, como Netflix, Spotify, etc.",
      icon: KeyRound,
    },
    {
      value: false,
      label: "Não requer senha",
      description: "Para serviços como TV por assinatura, internet, etc.",
      icon: Link,
    },
  ]

  return (
    <>
      <div className="space-y-4">
        <ControlledToggleGroup
          schema={z.boolean()}
          name="local.hasPassword"
          options={options}
          onSelect={(value) => {
            if (!value) {
              form.setValue("subscriptionAccount.encryptedAccountPassword", "")
            }
          }}
        />

        {form.watch("local.hasPassword") && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <ControlledInput<FormNewSubscription>
              schema={z.string().refine((value) => value.length >= 1, "A senha é obrigatória")}
              type="password"
              name="subscriptionAccount.encryptedAccountPassword"
              label="Senha de acesso"
              placeholder="Digite a senha do serviço"
            />
          </motion.div>
        )}
      </div>
      <div className="flex gap-4 justify-end mt-4">
        <Button type="button" variant="outline" onClick={prevStep}>
          Voltar
        </Button>

        <Button type="button" onClick={form.handleSubmit(onSubmit)}>
          Criar Assinatura
        </Button>
      </div>
    </>
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
