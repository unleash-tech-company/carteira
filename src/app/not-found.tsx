"use client"

import { TypographyH1, TypographyP } from "@/components/ui/typography"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="container mx-auto py-8 space-y-4">
      <TypographyH1>404 - Page Not Found</TypographyH1>
      <TypographyP>Sorry, we couldn't find the page you're looking for.</TypographyP>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  )
} 