"use client"

import { AuthLayout } from "@/app/components/auth-layout"
import { clerkAppearance } from "@/app/components/clerk-appearance"
import { useI18n } from "@/hooks/use-i18n"
import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  const { locale } = useI18n()

  return (
    <AuthLayout
      title={locale.auth.signUp.title}
      subtitle={locale.auth.signUp.subtitle}
      backButtonLabel={locale.auth.backToHome}
      footerText={locale.auth.signUp.hasAccount}
      footerActionText={locale.auth.signUp.signInAction}
      footerActionHref="/sign-in"
    >
      <SignUp appearance={clerkAppearance} path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/dashboard" />
    </AuthLayout>
  )
}
