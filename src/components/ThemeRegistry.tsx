'use client';

import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { ThemeContextProvider } from '@/theme/ThemeContext';
import { ToastProvider } from '@/components/ui/Toast';
import GlobalShortcuts from '@/components/ui/GlobalShortcuts';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeContextProvider>
        <ToastProvider>
          <GlobalShortcuts />
          {children}
        </ToastProvider>
      </ThemeContextProvider>
    </AppRouterCacheProvider>
  );
}
