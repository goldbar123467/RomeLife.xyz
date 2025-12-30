'use client';

import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={300}>
      {children}
      <Toaster />
    </TooltipProvider>
  );
}
