"use client"

import { TypographyH1 } from "@/components/ui/typography"
import { useSessionMonitor } from "@/hooks/use-session-monitor"
import { UserButton } from "@clerk/nextjs"
import { ChatSection } from "./components/posts-section"

export default function DashboardPage() {
  useSessionMonitor()

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <TypographyH1>Dashboard</TypographyH1>
        <UserButton afterSignOutUrl="/" />
      </div>
      <ChatSection />
    </div>
  )
}
