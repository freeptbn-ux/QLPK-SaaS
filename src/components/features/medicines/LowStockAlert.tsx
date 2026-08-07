'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

interface LowStockAlertProps {
  lowStockCount?: number;
  outOfStockCount?: number;
  stockFilter?: 'all' | 'low_stock' | 'out_of_stock';
  onFilterChange?: (filter: 'all' | 'low_stock' | 'out_of_stock') => void;
  count?: number;
  onFilterClick?: () => void;
  isFiltered?: boolean;
  onClearFilter?: () => void;
}

export default function LowStockAlert({ 
  lowStockCount: propLowStockCount, 
  outOfStockCount = 0, 
  stockFilter: propStockFilter, 
  onFilterChange,
  count,
  onFilterClick,
  isFiltered,
  onClearFilter
}: LowStockAlertProps) {
  const lowStockCount = propLowStockCount ?? count ?? 0;
  const stockFilter = propStockFilter ?? (isFiltered ? 'low_stock' : 'all');

  const show = outOfStockCount > 0 || lowStockCount > 0 || stockFilter !== 'all';

  const getMessage = () => {
    if (stockFilter === 'out_of_stock') return 'Đang hiển thị thuốc đã hết hàng.';
    if (stockFilter === 'low_stock') return 'Đang hiển thị thuốc sắp hết hàng.';
    if (outOfStockCount > 0 && lowStockCount > 0) {
      return `Có ${outOfStockCount} loại thuốc đã hết hàng và ${lowStockCount} loại sắp hết.`;
    }
    if (outOfStockCount > 0) return `Có ${outOfStockCount} loại thuốc đã hết hàng.`;
    if (lowStockCount > 0) return `Có ${lowStockCount} loại thuốc sắp hết hàng.`;
    return '';
  };

  const handleClear = () => {
    if (onFilterChange) {
      onFilterChange('all');
    } else if (onClearFilter) {
      onClearFilter();
    }
  };

  const handleFilterClick = () => {
    if (onFilterChange) {
      onFilterChange(outOfStockCount > 0 ? 'out_of_stock' : 'low_stock');
    } else if (onFilterClick) {
      onFilterClick();
    }
  };

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
                {getMessage()}
              </p>
            </div>
            <div className="shrink-0">
              {stockFilter !== 'all' ? (
                <button 
                  onClick={handleClear}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all active:scale-95 shadow-sm"
                >
                  Hiện tất cả
                </button>
              ) : (
                <button 
                  onClick={handleFilterClick}
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

