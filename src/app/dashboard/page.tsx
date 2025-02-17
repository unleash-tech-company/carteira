"use client";

import { UserButton } from "@clerk/nextjs";
import { useSessionMonitor } from "@/hooks/use-session-monitor";

export default function DashboardPage() {
  useSessionMonitor();

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <UserButton afterSignOutUrl="/" />
      </div>
      <div className="mt-4">
        <p>This is a protected page. Only authenticated users can see this content.</p>
      </div>
    </div>
  );
} 