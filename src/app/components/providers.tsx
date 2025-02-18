"use client"

import { TRPCProvider } from "@/components/providers/trpc-provider"
import { ptBR } from "@clerk/localizations"
import { ClerkProvider } from "@clerk/nextjs"
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState, type PropsWithChildren } from "react"
import { toast } from "sonner"

export function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
            retry: 1,
          },
          mutations: {
            retry: 1,
          },
        },
        queryCache: new QueryCache({
          onError: (error) => {
            if (error instanceof Error) {
              toast.error(error.message)
            }
          },
        }),
      })
  )

  return (
    <ClerkProvider localization={ptBR}>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <TRPCProvider queryClient={queryClient}>{children}</TRPCProvider>
      </QueryClientProvider>
    </ClerkProvider>
  )
}
