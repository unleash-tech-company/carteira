"use client"

import { AuroraBackground } from "@/app/components/aurora-background"
import { BottomCtaSection } from "@/app/components/bottom-cta"
import { Footer } from "@/app/components/footer"
import { PartnersSection } from "@/app/components/partners-section"
import { Pricing } from "@/app/components/pricing-cards"
import { ValueProposition } from "@/app/components/value-proposition"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { SignedIn, SignedOut } from "@clerk/nextjs"
import Link from "next/link"

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen overflow-x-hidden">
      <AuroraBackground>
        <PartnersSection />
        <SignedOut>
          <Link href="/sign-in">
            <RainbowButton className="mt-2 mx-4">Comece agora</RainbowButton>
          </Link>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard">
            <RainbowButton className="mt-2 mx-4">Vá ao painel</RainbowButton>
          </Link>
        </SignedIn>
      </AuroraBackground>
      <section className="px-4">
        <ValueProposition />
        <Pricing />
        <div className="flex items-center justify-center py-2">
          <Link href="https://buy.polar.sh/polar_cl_J4JVGlN6zndXSU9SDOdVbi82QPA3Hdx8c8YUx1WRjiD">
            <RainbowButton>Apoie o projeto</RainbowButton>
          </Link>
        </div>
      </section>
      <BottomCtaSection />
      <Footer />
    </main>
  )
}
