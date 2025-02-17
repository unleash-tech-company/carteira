"use client";

import { UserButton } from "@clerk/nextjs";
import { useSessionMonitor } from "@/hooks/use-session-monitor";
import { PostsSection } from "./components/posts-section";
import { TypographyH1 } from "@/components/ui/typography";

export default function DashboardPage() {
  useSessionMonitor();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <TypographyH1>Dashboard</TypographyH1>
        <UserButton afterSignOutUrl="/" />
      </div>
      <PostsSection />
    </div>
  );
} 