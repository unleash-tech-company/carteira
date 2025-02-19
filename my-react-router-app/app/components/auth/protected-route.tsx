import { useAuth } from "@clerk/react-router"
import type { PropsWithChildren } from "react"
import { Navigate } from "react-router"

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" />
  }

  return <>{children}</>
}
