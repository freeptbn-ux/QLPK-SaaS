'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from './LoadingProvider';
import BallLoader from './BallLoader';

/**
 * GlobalLoader component - A single source of truth for loading states.
 * Listens to useLoading() and renders a unified BallLoader as an overlay.
 */
export function GlobalLoader() {
  const { globalLoading, loadingText } = useLoading();

  return (
    <AnimatePresence>
      {globalLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 9999,
            pointerEvents: 'all'
          }}
        >
          <BallLoader isOverlay={true} text={loadingText} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default GlobalLoader;
