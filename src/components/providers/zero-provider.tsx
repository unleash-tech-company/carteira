"use client"

import { PropsWithChildren, createContext, useContext, useMemo } from "react"
import { useUser } from "@clerk/nextjs"
import { createClient, type Client } from "@/server/zero/client"

const ZeroContext = createContext<Client | null>(null)

export function useZeroContext() {
  const context = useContext(ZeroContext)
  if (!context) {
    throw new Error("useZeroContext must be used within a ZeroProvider")
  }
  return context
}

export function ZeroProvider({ children }: PropsWithChildren) {
  const { user, isLoaded } = useUser()

  const client = useMemo(() => {
    if (!isLoaded || !user) {
      return null
    }

    return createClient(user.id)
  }, [user, isLoaded])

  // Always provide the context, even if it's null
  // This ensures the provider wrapper is always present
  return (
    <ZeroContext.Provider value={client}>
      {/* Only render children when we have a valid client */}
      {client ? children : null}
    </ZeroContext.Provider>
  )
} 