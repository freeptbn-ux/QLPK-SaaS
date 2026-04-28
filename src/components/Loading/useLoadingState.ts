'use client';

import { useState, useEffect, useRef } from 'react';

interface UseLoadingStateOptions {
  delay?: number;
  minDuration?: number;
}

/**
 * Hook to manage loading state with delay and minimum duration.
 * Prevents "flickering" when data loads very quickly.
 * 
 * @param isLoading The initial loading state from the data source
 * @param options delay (ms) before showing loader, minDuration (ms) to keep loader visible
 */
export function useLoadingState(
  isLoading: boolean,
  { delay = 200, minDuration = 300 }: UseLoadingStateOptions = {}
) {
  const [shouldShow, setShouldShow] = useState(false);
  const loadingStartedAt = useRef<number | null>(null);
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const minDurationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const slowLoadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Logic for showing the loader...
      if (minDurationTimerRef.current) {
        clearTimeout(minDurationTimerRef.current);
        minDurationTimerRef.current = null;
      }

      if (!shouldShow) {
        delayTimerRef.current = setTimeout(() => {
          setShouldShow(true);
          loadingStartedAt.current = Date.now();
        }, delay);
      }

      // Slow loading warning
      if (!slowLoadingTimerRef.current) {
        slowLoadingTimerRef.current = setTimeout(() => {
          console.warn('[ui.loading.long] Loading state persisted for > 2000ms');
        }, 2000);
      }
    } else {
      // Clear slow loading timer
      if (slowLoadingTimerRef.current) {
        clearTimeout(slowLoadingTimerRef.current);
        slowLoadingTimerRef.current = null;
      }

      // Logic for hiding the loader...
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }

      if (shouldShow && loadingStartedAt.current) {
        const elapsed = Date.now() - loadingStartedAt.current;
        const remaining = Math.max(0, minDuration - elapsed);

        if (remaining > 0) {
          minDurationTimerRef.current = setTimeout(() => {
            setShouldShow(false);
            loadingStartedAt.current = null;
          }, remaining);
        } else {
          setShouldShow(false);
          loadingStartedAt.current = null;
        }
      } else {
        setShouldShow(false);
      }
    }

    return () => {
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      if (minDurationTimerRef.current) clearTimeout(minDurationTimerRef.current);
      if (slowLoadingTimerRef.current) clearTimeout(slowLoadingTimerRef.current);
    };
  }, [isLoading, delay, minDuration, shouldShow]);

  return shouldShow;
}
