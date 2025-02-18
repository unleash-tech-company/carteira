"use client"

import { useState, type PropsWithChildren } from "react"
import { QueryClient } from "@tanstack/react-query"
import { httpBatchLink } from "@trpc/client"
import superjson from "superjson"
import { api } from "@/utils/api"

function getBaseUrl() {
  if (typeof window !== "undefined") return ""
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}

interface TRPCProviderProps extends PropsWithChildren {
  queryClient: QueryClient
}

export function TRPCProvider({ children, queryClient }: TRPCProviderProps) {
  const [trpcClient] = useState(() =>
    api.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          headers() {
            return {
              "x-trpc-source": "react",
              "content-type": "application/json",
              "accept": "application/json",
            }
          },
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include",
              headers: {
                ...options?.headers,
                "content-type": "application/json",
                "accept": "application/json",
              },
            })
          },
        }),
      ],
    })
  )

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      {children}
    </api.Provider>
  )
} 