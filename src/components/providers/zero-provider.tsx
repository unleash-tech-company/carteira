import { PropsWithChildren } from "react"
import { createClient } from "@/server/zero/client"

const client = createClient()

export function ZeroProvider({ children }: PropsWithChildren) {
  return children
} 