import { SignIn } from "@clerk/react-router"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn routing="path" path="/sign-in" />
    </div>
  )
}
