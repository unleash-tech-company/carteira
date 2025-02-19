"use client"

import { schema } from "@/schema"
import { ClerkProvider } from "@clerk/clerk-react"
import { Zero } from "@rocicorp/zero"
import { ZeroProvider } from "@rocicorp/zero/react"
import { decodeJwt } from "jose"
import Cookies from "js-cookie"
import { useState, type PropsWithChildren } from "react"

export function Providers({ children }: PropsWithChildren) {
  const [zeroClient] = useState(() => {
    const encodedJWT = Cookies.get("jwt")
    const decodedJWT = encodedJWT && decodeJwt(encodedJWT)
    const userID = decodedJWT?.sub ? (decodedJWT.sub as string) : "anon"

    const z = new Zero({
      userID,
      auth: () => encodedJWT,
      server: "http://localhost:4848",
      schema,
      // This is often easier to develop with if you're frequently changing
      // the schema. Switch to 'idb' for local-persistence.
      kvStore: "idb",
    })

    return z
  })

  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <ZeroProvider zero={zeroClient}>{children}</ZeroProvider>
    </ClerkProvider>
  )
}
