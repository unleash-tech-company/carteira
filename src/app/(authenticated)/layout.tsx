"use client";

import { useSessionMonitor } from "@/hooks/use-session-monitor";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useSessionMonitor();

  return <>{children}</>;
} 