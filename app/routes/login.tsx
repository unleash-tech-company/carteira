import { SignIn } from "@clerk/react-router"
import { getAuth } from "@clerk/react-router/ssr.server"
import { redirect } from "react-router"
import type { Route } from "./+types/login"

export async function loader(args: Route.LoaderArgs) {
  const auth = await getAuth(args)
  const userId = auth.userId ?? "anon"
  const token = await auth.getToken()
  if (token && userId) {
    return redirect("/app")
  }

  return { token, userId }
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn routing="hash" />
    </div>
  )
}
