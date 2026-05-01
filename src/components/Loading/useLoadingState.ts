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
      // Clear any pending min duration timer
      if (minDurationTimerRef.current) {
        clearTimeout(minDurationTimerRef.current);
        minDurationTimerRef.current = null;
      }

      // Start delay timer if not already showing
      if (!shouldShow && !delayTimerRef.current) {
        delayTimerRef.current = setTimeout(() => {
          setShouldShow(true);
          loadingStartedAt.current = Date.now();
          delayTimerRef.current = null;
        }, delay);
      }

      // Slow loading warning (start if not already running)
      if (!slowLoadingTimerRef.current) {
        slowLoadingTimerRef.current = setTimeout(() => {
          console.warn(`[ui.loading.long] Loading state persisted for > 2000ms. (delay: ${delay}ms)`);
        }, 2000 + delay);
      }
    } else {
      // Clear delay timer if it hasn't fired yet
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }

      // Clear slow loading timer
      if (slowLoadingTimerRef.current) {
        clearTimeout(slowLoadingTimerRef.current);
        slowLoadingTimerRef.current = null;
      }

      // If we are currently showing, check minDuration
      if (shouldShow && loadingStartedAt.current) {
        const elapsed = Date.now() - loadingStartedAt.current;
        const remaining = Math.max(0, minDuration - elapsed);

        if (remaining > 0) {
          if (!minDurationTimerRef.current) {
            minDurationTimerRef.current = setTimeout(() => {
              setShouldShow(false);
              loadingStartedAt.current = null;
              minDurationTimerRef.current = null;
            }, remaining);
          }
        } else {
          setShouldShow(false);
          loadingStartedAt.current = null;
        }
      } else {
        setShouldShow(false);
      }
    }
  }, [isLoading, delay, minDuration, shouldShow]);

  useEffect(() => {
    return () => {
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      if (minDurationTimerRef.current) clearTimeout(minDurationTimerRef.current);
      if (slowLoadingTimerRef.current) clearTimeout(slowLoadingTimerRef.current);
    };
  }, []);

  return shouldShow;
}
