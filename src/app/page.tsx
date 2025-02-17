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
    <main className="flex min-h-screen flex-col overflow-x-hidden">
      <AuroraBackground>
        <PartnersSection className="" />
        <SignedOut>
          <Link href="/sign-in">
            <RainbowButton className="mt-10">Comece agora</RainbowButton>
          </Link>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard" className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90">
            <RainbowButton className="mt-10">Vá ao painel</RainbowButton>
          </Link>
        </SignedIn>
      </AuroraBackground>
      <ValueProposition />
      <Pricing />
      <BottomCtaSection />
      <Footer />
    </main>
  )
}
