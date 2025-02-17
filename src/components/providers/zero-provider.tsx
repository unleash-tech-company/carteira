"use client"

import { PropsWithChildren, createContext, useContext, useMemo } from "react"
import { createClient, type Client } from "@/server/zero/client"

const ZeroContext = createContext<Client | null>(null)

export function useZeroContext() {
  const context = useContext(ZeroContext)
  return context
}

export function ZeroProvider({ children }: PropsWithChildren) {
  const client = useMemo(() => {
    if (typeof window === "undefined") {
      return null
    }
    return createClient()
  }, [])

  return (
    <ZeroContext.Provider value={client}>
      {children}
    </ZeroContext.Provider>
  )
} 