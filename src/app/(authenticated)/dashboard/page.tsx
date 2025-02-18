"use client";

import { UserButton } from "@clerk/nextjs";
import { PostsSection } from "./components/posts-section";
import { TypographyH1 } from "@/components/ui/typography";

export default function DashboardPage() {
  return (
    <div className="container py-8 mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <TypographyH1>Dashboard</TypographyH1>
        <UserButton afterSignOutUrl="/" />
      </div>
      <PostsSection />
    </div>
  );
} 