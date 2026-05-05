'use client';

import { useEffect } from 'react';
import { useLoading } from './LoadingProvider';

interface LoadingReporterProps {
  text?: string;
}

/**
 * LoadingReporter is a silent component that reports the loading state to the Global LoadingProvider.
 * It does not render any UI itself, allowing the GlobalLoader to handle the display.
 */
export function LoadingReporter({ text = 'Đang tải...' }: LoadingReporterProps) {
  const { setIsStreaming, setLoadingText } = useLoading();

  useEffect(() => {
    // When the loading segment mounts, signal that we are streaming data
    setIsStreaming(true);
    setLoadingText(text);

    return () => {
      // When the segment completes and unmounts, signal that streaming has stopped
      setIsStreaming(false);
    };
  }, [setIsStreaming, setLoadingText, text]);

  // Render nothing as the GlobalLoader will handle the UI
  return null;
}
