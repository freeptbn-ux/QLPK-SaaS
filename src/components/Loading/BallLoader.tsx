'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import styles from './BallLoader.module.css';

export type BallLoaderSize = 'sm' | 'md' | 'lg';

export interface BallLoaderProps {
  /** Size of the loader: 'sm', 'md', 'lg' */
  size?: BallLoaderSize;
  /** Whether to show as a full-screen overlay */
  isOverlay?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
  /** Accessibility label */
  ariaLabel?: string;
  /** Custom text to show below the animation */
  text?: string;
}

/**
 * BallLoader component - A premium 4-ball rotating loader
 * Strictly follows Phase 01 requirements: Flat 2D, Blue/Red/Yellow/Green balls.
 */
export function BallLoader({
  size = 'md',
  isOverlay = false,
  className,
  ariaLabel = 'Đang tải...',
  text = 'Đang tải...',
}: BallLoaderProps) {
  return (
    <div
      className={cn(
        styles.container,
        styles[size],
        isOverlay && styles.overlay,
        className
      )}
      aria-label={ariaLabel}
      role="status"
    >
      <div className={styles.ballWrapper}>
        <div className={cn(styles.ball, styles.blue)} />
        <div className={cn(styles.ball, styles.red)} />
        <div className={cn(styles.ball, styles.yellow)} />
        <div className={cn(styles.ball, styles.green)} />
      </div>
      {text && <span className={styles.text}>{text}</span>}
    </div>
  );
}

export default BallLoader;
