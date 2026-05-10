'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiInformationCircle, HiExclamationCircle, HiRefresh } from 'react-icons/hi';
import { cn } from '@/lib/utils/cn';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface SpeechBubbleProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
  anchorEl?: HTMLElement | null;
  children: React.ReactNode;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  title?: string;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  isOpen,
  onClose,
  anchorRef,
  anchorEl,
  children,
  loading = false,
  error = false,
  onRetry,
  title,
}) => {
  const targetEl = anchorEl || anchorRef?.current;
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, placement: 'top' as 'top' | 'bottom' });
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle Click Outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen && 
        bubbleRef.current && 
        !bubbleRef.current.contains(e.target as Node) &&
        targetEl &&
        !targetEl.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    if (isOpen && !isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMobile, onClose, targetEl]);

  // Calculate position for desktop
  useEffect(() => {
    if (!isOpen || isMobile || !targetEl) return;

    const updatePosition = () => {
      if (!targetEl) return;
      const anchorRect = targetEl.getBoundingClientRect();
      const bubbleWidth = Math.min(window.innerWidth - 40, 380);
      const bubbleMaxHeight = 400;
      const spacing = 16; // space for the "tail"

      let top = anchorRect.top + window.scrollY - bubbleMaxHeight - spacing;
      let left = anchorRect.left + window.scrollX + anchorRect.width / 2 - bubbleWidth / 2;
      let placement: 'top' | 'bottom' = 'top';

      // Check if there is enough space on top
      if (anchorRect.top < bubbleMaxHeight + spacing + 20) {
        top = anchorRect.bottom + window.scrollY + spacing;
        placement = 'bottom';
      }

      // Constrain horizontal position within viewport
      if (left < 10) left = 10;
      if (left + bubbleWidth > window.innerWidth - 10) {
        left = window.innerWidth - bubbleWidth - 10;
      }

      setPosition({ top, left, placement });
    };

    updatePosition();
    
    // Listen to resize and scroll to keep the bubble attached to the anchor
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true); // Use capture phase to handle nested scrolls

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, isMobile, anchorRef]);

  if (!mounted) return null;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Overlay */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-[100]"
              onClick={onClose}
            />
          )}

          {/* Bubble / Bottom Sheet */}
          <motion.div
            ref={bubbleRef}
            role="dialog"
            aria-modal="true"
            aria-label={title || "Speech Bubble"}
            initial={
              isMobile
                ? { y: '100%' }
                : { opacity: 0, scale: 0.85, y: position.placement === 'top' ? 10 : -10 }
            }
            animate={
              isMobile
                ? { y: 0 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={
              isMobile
                ? { y: '100%' }
                : { opacity: 0, scale: 0.85, y: position.placement === 'top' ? 10 : -10 }
            }
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={
              !isMobile
                ? {
                    position: 'absolute',
                    top: position.top,
                    left: position.left,
                    width: '380px',
                    maxWidth: 'calc(100vw - 20px)',
                    zIndex: 101,
                  }
                : {
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 101,
                  }
            }
            className={cn(
              "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl",
              isMobile 
                ? "rounded-t-2xl max-h-[70vh] flex flex-col" 
                : "rounded-2xl"
            )}
          >
            {/* Mobile Drag Handle */}
            {isMobile && (
              <div className="w-12 h-1 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto my-3 flex-shrink-0" />
            )}

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <HiInformationCircle className="w-5 h-5" />
                <span>{title || "Tra cứu liều dùng"}</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                aria-label="Close"
              >
                <HiX className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 overflow-y-auto custom-scrollbar flex-grow select-text" style={{ maxHeight: isMobile ? 'none' : '320px' }}>
              {loading ? (
                <div className="space-y-4 animate-pulse py-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4" />
                  <div className="space-y-3">
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-full" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-5/6" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-full" />
                  </div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-1/2 pt-4" />
                  <div className="space-y-3">
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-full" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-4/5" />
                  </div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <HiExclamationCircle className="w-12 h-12 text-red-500 mb-2" />
                  <p className="text-slate-700 dark:text-slate-200 mb-4">
                    Không tìm thấy thông tin liều dùng cho thuốc này.
                  </p>
                  {onRetry && (
                    <button
                      onClick={onRetry}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <HiRefresh className="w-4 h-4" />
                      Thử lại
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-line">
                  {children}
                </div>
              )}
            </div>

            {/* Desktop Tail */}
            {!isMobile && !loading && (
              <div 
                className={cn(
                  "absolute w-4 h-4 bg-white dark:bg-slate-800 border-r border-b border-slate-200 dark:border-slate-700 transform rotate-45 left-1/2 -ml-2",
                  position.placement === 'top' ? "-bottom-2" : "-top-2 rotate-[225deg]"
                )}
              />
            )}

            {/* Mobile Footer */}
            {isMobile && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex-shrink-0">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Đóng
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};

export default SpeechBubble;
