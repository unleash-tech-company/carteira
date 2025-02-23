import { Button } from "@/components/ui/button"
import { TypographyH2 } from "@/components/ui/typography"
import { Player } from "@lottiefiles/react-lottie-player"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { successAnimation } from "../animations/success-check"

interface SuccessScreenProps {
  subscriptionName: string
  subscriptionId: string
  name: string
  onBackToHome: () => void
}

export function SuccessScreen({ subscriptionName, subscriptionId, name, onBackToHome }: SuccessScreenProps) {
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/app/subscriptions/${subscriptionId}/join`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Junte-se à assinatura ${name}`,
          text: `Venha participar da assinatura compartilhada ${name}! Clique no link para entrar:`,
          url: shareUrl,
        })
      } catch (error) {
        console.error("Erro ao compartilhar:", error)
      }
    } else {
      navigator.clipboard.writeText(shareUrl)
    }

    toast.success("Link copiado para a área de transferência!", {
      description: "Agora você pode compartilhar com quem quiser convidar.",
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center"
    >
      <div className="w-full max-w-xl mx-auto px-4 py-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="mx-auto w-[200px] h-[200px] relative"
        >
          <Player
            autoplay
            keepLastFrame
            loop={false}
            src={successAnimation}
            style={{ width: "100%", height: "100%" }}
            className="absolute inset-0"
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.8,
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="space-y-4"
        >
          <TypographyH2>Assinatura Criada com Sucesso!</TypographyH2>
          <p className="text-muted-foreground">
            Sua assinatura {subscriptionName} foi criada. Compartilhe com seus amigos para que eles possam participar!
          </p>

          <div className="flex flex-col gap-4 mt-8">
            <Button onClick={handleShare} size="lg" className="relative overflow-hidden group">
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.3 }}
                className="absolute inset-0 bg-primary/10 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform"
              />
              Compartilhar Link
            </Button>
            <Button variant="outline" onClick={onBackToHome} size="lg">
              Voltar para o Início
            </Button>
          </div>

          <div className="mt-8 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
            <p className="mb-2">
              <span className="font-medium">Importante:</span> Esta assinatura não está pública e só pode ser encontrada
              através do link de convite.
            </p>
            <p>
              Você sempre poderá acessar e compartilhar o link de convite posteriormente através da página da
              assinatura. Apenas membros com o link poderão solicitar participação.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
