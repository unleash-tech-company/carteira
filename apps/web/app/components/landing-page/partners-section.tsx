"use client"

import { GradientHeading, headingVariants } from "@/components/ui/gradient-headings"
import { LogoCarousel } from "@/components/ui/logo-carousel"
import { Typewriter } from "@/components/ui/typewriter"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

import appleTv from "./logos/apple-tv.svg"
import audible from "./logos/audible.svg"
import bitwarden from "./logos/bitwarden.svg"
import canvaPro from "./logos/canva-pro.svg"
import coursera from "./logos/coursera.svg"
import crunchyroll from "./logos/crunchroll.svg"
import grammarly from "./logos/gramally.svg"
import hbo from "./logos/hbo.svg"
import netflix from "./logos/netflix.svg"
import primeVideo from "./logos/prime-video.svg"
import skillshare from "./logos/skill-share.svg"
import spotify from "./logos/spotify.svg"
import udemy from "./logos/udemy.svg"

export function PartnersSection({ className }: PartnersSectionProps) {
  const isMobile = useIsMobile()

  return (
    <section className={cn(className)}>
      <div className={cn("max-w-7xl mx-auto px-4 flex flex-col items-center gap-4")}>
        <div className={cn("flex flex-col items-center text-center")}>
          <GradientHeading variant="secondary">{CONTENT.title.primary}</GradientHeading>
          <GradientHeading size="xl">{CONTENT.title.secondary}</GradientHeading>
          <Typewriter className={cn(headingVariants({ size: "xl" }))} text={CONTENT.typewriter} />
        </div>
        <LogoCarousel logos={partners} columnCount={isMobile ? 3 : 4} />
      </div>
    </section>
  )
}

interface PartnersSectionProps {
  className?: string
}

const CONTENT = {
  title: {
    primary: "Gerencie suas assinaturas",
    secondary: "Compartilhe",
  },
  typewriter: ["com um amigo", "com um colega do trabalho", "com quem você ama", "com quem você quiser!"],
}

const partners = [
  {
    name: "Bitwarden",
    id: 1,
    img: (props: any) => (
      <img
        src={bitwarden}
        width={100}
        height={100}
        alt="Bitwarden"
        className={cn("h-full w-full object-contain", props.className)}
      />
    ),
  },
  {
    name: "Netflix",
    id: 2,
    img: (props: any) => (
      <img src={netflix} alt="Netflix" className={cn("h-full w-full object-contain", props.className)} />
    ),
  },
  {
    name: "Spotify",
    id: 3,
    img: (props: any) => (
      <img
        src={spotify}
        width={100}
        height={100}
        alt="Spotify"
        className={cn("h-full w-full object-contain", props.className)}
      />
    ),
  },
  {
    name: "Apple TV+",
    id: 4,
    img: (props: any) => (
      <img
        src={appleTv}
        width={100}
        height={100}
        alt="Apple TV+"
        className={cn("h-full w-full object-contain", props.className)}
      />
    ),
  },
  {
    name: "Prime Video",
    id: 6,
    img: (props: any) => (
      <img
        src={primeVideo}
        width={100}
        height={100}
        alt="Prime Video"
        className={cn("h-full w-full object-contain", props.className)}
      />
    ),
  },
  {
    name: "Audible",
    id: 7,
    img: (props: any) => (
      <img
        width={100}
        height={100}
        src={audible}
        alt="Audible"
        className={cn("h-full w-full object-contain", props.className)}
      />
    ),
  },
  {
    name: "Coursera",
    id: 8,
    img: (props: any) => (
      <img
        width={100}
        height={100}
        src={coursera}
        alt="Coursera"
        className={cn("h-full w-full object-contain", props.className)}
      />
    ),
  },
  {
    name: "Crunchyroll",
    id: 9,
    img: (props: any) => (
      <img
        width={100}
        height={100}
        src={crunchyroll}
        alt="Crunchyroll"
        className={cn("h-full w-full object-contain", props.className)}
      />
    ),
  },
  {
    name: "HBO",
    id: 10,
    img: (props: any) => (
      <img
        width={100}
        height={100}
        src={hbo}
        alt="HBO"
        className={cn("h-full w-full object-contain", props.className)}
      />
    ),
  },
  {
    name: "Udemy",
    id: 11,
    img: (props: any) => (
      <img
        width={100}
        height={100}
        src={udemy}
        alt="Udemy"
        className={cn("h-full w-full object-contain", props.className)}
      />
    ),
  },
  {
    name: "Grammarly",
    id: 12,
    img: (props: any) => (
      <img
        src={grammarly}
        alt="Grammarly"
        className={cn("h-full w-full object-contain", props.className)}
        width={100}
        height={100}
      />
    ),
  },
  {
    name: "Skillshare",
    id: 13,
    img: (props: any) => (
      <img
        width={100}
        height={100}
        src={skillshare}
        alt="Skillshare"
        className={cn("h-full w-full object-contain", props.className)}
      />
    ),
  },
  {
    name: "Canva Pro",
    id: 14,
    img: (props: any) => (
      <img
        src={canvaPro}
        width={100}
        height={100}
        alt="Canva Pro"
        className={cn("h-full w-full object-contain", props.className)}
      />
    ),
  },
]
