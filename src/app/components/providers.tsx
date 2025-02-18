"use client"

import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { useState, type PropsWithChildren } from "react"
import { ClerkProvider } from "@clerk/nextjs"
import { TRPCProvider } from "@/components/providers/trpc-provider"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { toast } from "sonner"
import { AppProvider } from "@/components/providers/app-provider"

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
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <TRPCProvider queryClient={queryClient}>
          <AppProvider>
            {children}
          </AppProvider>
        </TRPCProvider>
      </QueryClientProvider>
    </ClerkProvider>
  )
}
