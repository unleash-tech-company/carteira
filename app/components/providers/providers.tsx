import { ClerkProvider } from "@clerk/clerk-react"
import type { PropsWithChildren } from "react"

export function Providers({ children }: PropsWithChildren) {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <>{children}</>
    </ClerkProvider>
  )
}
