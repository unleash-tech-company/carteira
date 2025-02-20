import { schema } from "@/db/schema"
import { getAuth } from "@clerk/react-router/ssr.server"
import { Zero } from "@rocicorp/zero"
import { ZeroProvider } from "@rocicorp/zero/react"
import React from "react"
import { Outlet, redirect, useLoaderData } from "react-router"
import type { Route } from "../+types/root"

export async function loader(args: Route.LoaderArgs) {
  const auth = await getAuth(args)
  const userId = auth.userId ?? "anon"
  const token = await auth.getToken()
  if (!token || !userId) {
    return redirect("login")
  }
  return { token, userId }
}

export default function ProtectedLayout() {
  const { token, userId } = useLoaderData<typeof loader>()
  const [zeroClient] = React.useState(() => {
    return new Zero({
      userID: userId,
      auth: () => {
        return token
      },
      server: "http://localhost:4848",
      schema,
      kvStore: "mem",
    })
  })
  return (
    <ZeroProvider zero={zeroClient}>
      <Outlet />
    </ZeroProvider>
  )
}
