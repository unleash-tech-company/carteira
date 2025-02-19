import { UserButton } from "@clerk/react-router"

export function DashboardPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-end mb-8">
        <UserButton afterSignOutUrl="/sign-in" />
      </div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-4">Welcome to your dashboard!</p>
    </div>
  )
}
