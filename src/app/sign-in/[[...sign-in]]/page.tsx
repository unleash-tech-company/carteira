"use client"

import { AuthLayout } from "@/app/components/auth-layout"
import { clerkAppearance } from "@/app/components/clerk-appearance"
import { SignIn } from "@clerk/nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const forcedRedirect = searchParams.get("forcedRedirect")

  useEffect(() => {
    if (forcedRedirect) {
      toast.error("Detected additional sessions, you've been signed out")
      router.replace("/sign-in")
    }
  }, [forcedRedirect, router])

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Choose how you'd like to sign in"
      footerText="Don't have an account?"
      footerActionText="Sign up"
      footerActionHref="/sign-up"
    >
      <SignIn appearance={clerkAppearance} path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/dashboard" />
    </AuthLayout>
  )
}
