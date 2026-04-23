'use client';

import * as React from 'react';
import { ThemeContextProvider } from '@/theme/ThemeContext';
import { ToastProvider } from '@/components/ui/Toast';
import GlobalShortcuts from '@/components/ui/GlobalShortcuts';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContextProvider>
      <ToastProvider>
        <GlobalShortcuts />
        {children}
      </ToastProvider>
    </ThemeContextProvider>
  );
}
