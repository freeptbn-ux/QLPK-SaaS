'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

interface LowStockAlertProps {
  count: number;
  onFilterClick: () => void;
  isFiltered: boolean;
  onClearFilter: () => void;
}

export default function LowStockAlert({ count, onFilterClick, isFiltered, onClearFilter }: LowStockAlertProps) {
  const show = count > 0 || isFiltered;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0, marginBottom: 0 }}
          animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
          exit={{ height: 0, opacity: 0, marginBottom: 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-200 shadow-sm shadow-amber-500/5">
            <div className="shrink-0 bg-white dark:bg-slate-900 p-2 rounded-xl shadow-sm border border-amber-100 dark:border-amber-900/50">
              <HiOutlineExclamationTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-grow">
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100">Cảnh báo tồn kho</h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {isFiltered 
                  ? `Đang hiển thị ${count} loại thuốc sắp hết hàng.`
                  : `Có ${count} loại thuốc sắp hết hàng (dưới ngưỡng cảnh báo).`
                }
              </p>
            </div>
            <div className="shrink-0">
              {isFiltered ? (
                <button 
                  onClick={onClearFilter}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all active:scale-95 shadow-sm"
                >
                  Hiện tất cả
                </button>
              ) : (
                <button 
                  onClick={onFilterClick}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all active:scale-95 shadow-lg shadow-amber-600/20"
                >
                  Xem danh sách
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
