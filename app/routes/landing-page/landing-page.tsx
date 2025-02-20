import { RainbowButton } from "@/components/ui/rainbow-button"
import { AuroraBackground } from "@/routes/landing-page/components/aurora-background"
import { BottomCtaSection } from "@/routes/landing-page/components/bottom-cta"
import { Footer } from "@/routes/landing-page/components/footer"
import { PartnersSection } from "@/routes/landing-page/components/partners-section"
import { Pricing } from "@/routes/landing-page/components/pricing-cards"
import { ValueProposition } from "@/routes/landing-page/components/value-proposition"
import { Link } from "react-router"
import type { Route } from "../+types/landing-page"

export function meta({}: Route.MetaArgs) {
  return [{ title: "Economize AI" }, { name: "description", content: "Economize AI" }]
}

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden">
      <AuroraBackground>
        <PartnersSection className="" />
        <Link to="/login">
          <RainbowButton className="mt-10">Comece agora</RainbowButton>
        </Link>
        <Link to="/dashboard">
          <RainbowButton className="mt-10">Vá ao painel</RainbowButton>
        </Link>
      </AuroraBackground>
      <ValueProposition />
      <Pricing />
      <BottomCtaSection />
      <Footer />
    </main>
  )
}
