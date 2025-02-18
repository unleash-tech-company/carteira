"use client";

import { UserButton } from "@clerk/nextjs";
import { PostsSection } from "./components/posts-section";
import { TypographyH1 } from "@/components/ui/typography";
import { RainbowButton } from "@/components/ui/rainbow-button";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="container py-8 mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <TypographyH1>Dashboard</TypographyH1>
        <UserButton afterSignOutUrl="/" />
      </div>
      <PostsSection />
      <div className="flex items-center justify-center">
        <Link href="https://buy.polar.sh/polar_cl_J4JVGlN6zndXSU9SDOdVbi82QPA3Hdx8c8YUx1WRjiD">
          <RainbowButton>Apoie o projeto</RainbowButton>
        </Link>
      </div>
    </div>
  );
} 