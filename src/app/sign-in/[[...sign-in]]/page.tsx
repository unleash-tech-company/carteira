"use client"

import { AuthLayout } from "@/app/components/auth-layout"
import { clerkAppearance } from "@/app/components/clerk-appearance"
import { useI18n } from "@/hooks/use-i18n"
import { SignIn } from "@clerk/nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { locale } = useI18n()

  const forcedRedirect = searchParams.get("forcedRedirect")

  useEffect(() => {
    if (forcedRedirect) {
      toast.error(locale.auth.errors.multipleSessions)
      router.replace("/sign-in")
    }
  }, [forcedRedirect, router, locale])

  return (
    <AuthLayout
      title={locale.auth.signIn.title}
      subtitle={locale.auth.signIn.subtitle}
      backButtonLabel={locale.auth.backToHome}
      footerText={locale.auth.signIn.noAccount}
      footerActionText={locale.auth.signIn.signUpAction}
      footerActionHref="/sign-up"
    >
      <SignIn appearance={clerkAppearance} path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/dashboard" />
    </AuthLayout>
  )
}
