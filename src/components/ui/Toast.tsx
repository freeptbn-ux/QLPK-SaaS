'use client';

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiXCircle, HiXMark } from 'react-icons/hi2';

export type AlertColor = 'success' | 'info' | 'warning' | 'error';

interface ToastContextType {
  showToast: (message: string, severity?: AlertColor) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('info');

  const showToast = useCallback((msg: string, sev: AlertColor = 'info') => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setOpen(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const icons = {
    success: <HiCheckCircle className="h-5 w-5 text-green-500" />,
    error: <HiXCircle className="h-5 w-5 text-red-500" />,
    warning: <HiExclamationCircle className="h-5 w-5 text-amber-500" />,
    info: <HiInformationCircle className="h-5 w-5 text-blue-500" />,
  };

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
    warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
        <AnimatePresence mode="wait">
          {open && (
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border shadow-xl shadow-gray-200/20 dark:shadow-none min-w-[300px] max-w-md ${styles[severity]}`}
            >
              <div className="shrink-0">{icons[severity]}</div>
              <p className="text-sm font-semibold flex-1 leading-tight">
                {message}
              </p>
              <button
                onClick={handleClose}
                className="shrink-0 ml-2 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <HiXMark className="h-4 w-4 opacity-50 hover:opacity-100" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
