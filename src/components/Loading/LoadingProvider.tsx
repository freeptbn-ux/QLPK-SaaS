'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';

interface LoadingContextType {
  isNavigating: boolean;
  isStreaming: boolean;
  loadingText: string;
  globalLoading: boolean;
  startLoading: (text?: string) => void;
  stopLoading: () => void;
  setIsNavigating: (val: boolean) => void;
  setIsStreaming: (val: boolean) => void;
  setLoadingText: (text: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loadingText, setLoadingText] = useState('Đang tải');

  const startLoading = useCallback((text?: string) => {
    if (text) setLoadingText(text);
    setIsNavigating(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsNavigating(false);
    setIsStreaming(false);
  }, []);

  const globalLoading = isNavigating || isStreaming;

  const value = useMemo(
    () => ({
      isNavigating,
      isStreaming,
      loadingText,
      globalLoading,
      startLoading,
      stopLoading,
      setIsNavigating,
      setIsStreaming,
      setLoadingText,
    }),
    [isNavigating, isStreaming, loadingText, globalLoading, startLoading, stopLoading]
  );

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
