"use client"

import { AuthLayout } from "@/app/components/auth-layout"
import { clerkAppearance } from "@/app/components/clerk-appearance"
import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create an account"
      subtitle="Choose how you'd like to create your account"
      footerText="Already have an account?"
      footerActionText="Sign in"
      footerActionHref="/sign-in"
    >
      <SignUp appearance={clerkAppearance} path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/dashboard" />
    </AuthLayout>
  )
}
