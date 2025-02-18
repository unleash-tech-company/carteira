"use client"

import { Check, Gift, MoveRight, PartyPopper, PhoneCall } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TypographyH2, TypographyP, TypographyLead, TypographySmall } from "@/components/ui/typography"
import { cn } from "@/lib/utils"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

interface PricingProps {
  className?: string
}

export function Pricing({ className }: PricingProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <div className={cn(className)} ref={ref}>
      <div className={cn("container mx-auto")}>
        <div className={cn("flex gap-4 flex-col")}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="self-start">{CONTENT.badge}</Badge>
          </motion.div>

          <div className="flex flex-col gap-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-baseline gap-2"
            >
              <TypographyH2 className="text-5xl tracking-tighter font-regular">
                100% Grátis{" "}
                <span className="text-sm tracking-tighter md:text-sm font-regular">
                  (E Sem Letrinha Miúda Pra Te Pegar)! 🎉
                </span>
              </TypographyH2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <TypographyLead className="max-w-xl leading-relaxed text-muted-foreground">
                {CONTENT.description}
              </TypographyLead>
            </motion.div>
          </div>

          <motion.div
            className="flex justify-center w-full pt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="w-full max-w-2xl">
              {CONTENT.plans.map((plan) => (
                <PricingCard key={plan.id} {...plan} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function PricingCard({ title, description, price, features, buttonText, variant = "outline" }: PricingCardProps) {
  return (
    <Card className={cn(
      "w-full rounded-xl transition-all duration-300",
      "hover:scale-[1.01]",
      "bg-gradient-to-b from-white to-gray-50/50 dark:from-zinc-900 dark:to-zinc-900/50",
      variant === "featured" ? [
        "shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
        "dark:shadow-[0_8px_30px_rgb(255,255,255,0.04)]",
        "border-primary/20",
        "hover:shadow-[0_10px_40px_rgb(0,0,0,0.15)]",
        "dark:hover:shadow-[0_10px_40px_rgb(255,255,255,0.06)]"
      ] : [
        "hover:shadow-[0_4px_18px_rgb(0,0,0,0.1)]",
        "dark:hover:shadow-[0_4px_18px_rgb(255,255,255,0.03)]"
      ]
    )}>
      <CardHeader className="p-6 md:p-8">
        <CardTitle>
          <pre className="flex flex-row items-center gap-4 text-lg font-normal md:text-xl">{title}</pre>
        </CardTitle>
        <CardDescription className="text-sm md:text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0 md:p-8 md:pt-0">
        <div className="flex flex-col justify-start gap-8">
          <p className="flex flex-row items-baseline gap-2">
            <span className="text-4xl font-medium md:text-5xl">R${price}</span>
            <span className="text-sm text-muted-foreground"> / mês</span>
          </p>
          <div className="flex flex-col justify-start gap-5">
            {features.map((feature, index) => (
              <FeatureItem key={index} {...feature} />
            ))}
          </div>
          {buttonText && (
            <Button 
              variant={variant === "featured" ? "default" : "outline"} 
              className={cn(
                "gap-4 w-full md:w-auto transition-colors",
                "hover:bg-primary/90 dark:hover:bg-primary/90",
                variant === "featured" && "bg-primary text-primary-foreground"
              )}
            >
              {buttonText}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function FeatureItem({ title, description, badge }: { title: string; description: string; badge?: string }) {
  return (
    <div className="flex flex-row gap-4 group">
      <Check className="w-4 h-4 mt-1.5 text-primary transition-transform group-hover:scale-110" />
      <div className="flex flex-col gap-1">
        <div className="flex flex-row flex-wrap items-center gap-2">
          <TypographyP className="font-medium">{title}</TypographyP>
          {badge && (
            <Badge className="text-[10px] md:text-xs text-primary-foreground h-4 opacity-40 whitespace-nowrap bg-primary/10 hover:bg-primary/20 transition-colors">
              {badge}
            </Badge>
          )}
        </div>
        <TypographySmall className="text-sm leading-relaxed text-muted-foreground">{description}</TypographySmall>
      </div>
    </div>
  )
}

interface PricingCardProps {
  title: string
  description: string
  price: number
  features: Array<{
    title: string
    description: string
  }>
  buttonText?: string
  variant?: "default" | "featured" | "outline"
  badge?: string
}

const CONTENT = {
  badge: "Descomplique",
  description:
    "Por que pagar se você pode compartilhar, economizar e até ganhar um trocado? Nós também odamos taxas escondidas!",
  plans: [
    {
      id: 1,
      title: "Plano Dividir & Poupar 💰",
      description: "Para quem curte um *upgrade* na vida sem *downgrade* na carteira.",
      price: 0,
      features: [
        {
          title: "Assinaturas Ilimitadas",
          description:
            "Adicione quantos serviços quiser: Netflix, Udemy, Crunchyroll, Disney+... Se existe, você pode compartilhar! 🎬",
        },
        {
          title: "Divisão de Custos Automática",
          description:
            "Para evitar aquele climão no grupo da família. Calculamos tudo, até a sua parte do 'amigo esquecido'. 😅",
        },
        {
          title: "Monetização 'De Quebrada'",
          description:
            "Revenda acessos e transforme sua assinatura em renda extra. Pra pagar a pizza do final de semana! 🍕",
        },
        {
          title: "Dashboard da Economia",
          description: "Veja quanto você salvou pra gastar em coisas que importam: café, memes e sonecas. ☕",
        },
        {
          title: "Notificações Anti-Calote",
          description: "Lembramos você (e o primo distante) de renovar a assinatura. Nada de 'ah, esqueci'!",
          badge: "Em breve",
        },
      ],
      // buttonText: "Quero Tudo de Graça! 🤑",
      // buttonIcon: PartyPopper, // Ícone de festa para reforçar o tom
      variant: "featured" as const,
    },
  ],
}
