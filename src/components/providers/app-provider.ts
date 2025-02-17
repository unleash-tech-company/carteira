'use client';

import { useSessionMonitor } from '@/hooks/use-session-monitor';
import { PropsWithChildren } from 'react';

export function AppProvider({ children }: PropsWithChildren) {
  useSessionMonitor()
  return children
}
