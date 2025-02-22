import { AuroraBackground } from "@/components/landing-page/aurora-background"
import { BottomCtaSection } from "@/components/landing-page/bottom-cta"
import { Footer } from "@/components/landing-page/footer"
import { PartnersSection } from "@/components/landing-page/partners-section"
import { Pricing } from "@/components/landing-page/pricing-cards"
import { ValueProposition } from "@/components/landing-page/value-proposition"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { Link } from "react-router"
import type { Route } from "./+types/landing-page"

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
      </AuroraBackground>
      <ValueProposition />
      <Pricing />
      <BottomCtaSection />
      <Footer />
    </main>
  )
}
