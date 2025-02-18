"use client"

import { AuroraBackground } from "@/components/aurora-background"
import { BottomCtaSection } from "@/components/bottom-cta"
import { Footer } from "@/components/footer"
import { PartnersSection } from "@/components/partners-section"
import { Pricing } from "@/components/pricing-cards"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { ValueProposition } from "@/components/value-proposition"
import { Link } from "react-router"

export function Welcome() {
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden">
      <AuroraBackground>
        <PartnersSection className="" />
        <Link to="/sign-in">
          <RainbowButton className="mt-10">Comece agora</RainbowButton>
        </Link>
        <Link to="/dashboard" className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90">
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
