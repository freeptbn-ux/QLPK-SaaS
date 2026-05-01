'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import styles from './Loading.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoadingState } from './useLoadingState';

export type LoadingVariant = 'spinner' | 'skeleton' | 'shimmer' | 'bar';
export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

export interface LoadingProps {
  /** Current loading state */
  isLoading?: boolean;
  /** Visual style: spinner, skeleton (pulse), shimmer (moving light), bar (progress line) */
  variant?: LoadingVariant;
  /** Size preset */
  size?: LoadingSize;
  /** Delay in ms before showing the loader */
  delay?: number;
  /** Minimum duration in ms to show the loader to prevent flickering */
  minDuration?: number;
  /** Additional CSS classes */
  className?: string;
  /** Accessibility label */
  ariaLabel?: string;
  /** Content to show when NOT loading */
  children?: React.ReactNode;
}

const sizeMap: Record<LoadingSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

const skeletonSizeMap: Record<LoadingSize, string> = {
  sm: 'h-4 w-24',
  md: 'h-8 w-48',
  lg: 'h-12 w-full',
  xl: 'h-24 w-full',
};

export function Loading({
  isLoading = true,
  variant = 'spinner',
  size = 'md',
  delay = 200,
  minDuration = 300,
  className,
  ariaLabel = 'Đang tải...',
  children,
}: LoadingProps) {
  const showLoader = useLoadingState(isLoading, { delay, minDuration });

  // If we have children and we're NOT showing the loader, return the children
  if (children && !showLoader) {
    return <>{children}</>;
  }

  // If we're NOT loading and have no children, return null
  if (!showLoader && !children) {
    return null;
  }

  const renderLoader = () => {
    switch (variant) {
      case 'shimmer':
        return (
          <div
            className={cn(
              styles.shimmer,
              skeletonSizeMap[size],
              'rounded-lg',
              className
            )}
            aria-label={ariaLabel}
            role="status"
          />
        );
      case 'skeleton':
        return (
          <div
            className={cn(
              'animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg',
              skeletonSizeMap[size],
              className
            )}
            aria-label={ariaLabel}
            role="status"
          />
        );
      case 'bar':
        return (
          <div
            className={cn(
              styles.bar,
              className
            )}
            aria-label={ariaLabel}
            role="status"
          />
        );
      case 'spinner':
      default:
        return (
          <div
            className={cn(
              'flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400',
              sizeMap[size],
              className
            )}
            aria-label={ariaLabel}
            role="status"
          >
            <span>Loading</span>
            <span className={styles.dots} />
          </div>
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      {showLoader && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'flex items-center justify-center w-full',
            !children && 'py-4'
          )}
        >
          {renderLoader()}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Loading;
