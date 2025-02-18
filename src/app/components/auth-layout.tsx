import Link from "next/link"
import { type PropsWithChildren } from "react"

interface AuthLayoutProps extends PropsWithChildren {
  title: string
  subtitle: string
  backButtonLabel?: string
  footerText?: string
  footerActionText?: string
  footerActionHref?: string
}

export function AuthLayout({
  children,
  title,
  subtitle,
  backButtonLabel = "Back to home",
  footerText,
  footerActionText,
  footerActionHref,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-primary">
        ← {backButtonLabel}
      </Link>

      <div className="flex w-full flex-col items-center space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {children}

        {footerText && footerActionText && footerActionHref && (
          <p className="px-8 text-center text-sm text-muted-foreground">
            {footerText}{" "}
            <Link href={footerActionHref} className="hover:text-brand underline underline-offset-4 hover:text-primary">
              {footerActionText}
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
