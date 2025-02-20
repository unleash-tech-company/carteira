import { TypographyH1 } from "@/components/ui/typography"
import { SubscriptionList } from "./components/subscription-list"

export default function ProtectedPage() {
  return (
    <main className="container mx-auto py-8">
      <TypographyH1>Gerenciamento de Assinaturas</TypographyH1>
      <SubscriptionList />
    </main>
  )
}
