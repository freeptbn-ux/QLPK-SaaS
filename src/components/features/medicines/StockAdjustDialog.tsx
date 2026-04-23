'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineXMark } from 'react-icons/hi2';
import { Medicine } from '@/types/database';
import { updateMedicineStock } from '@/actions/medicines';
import { cn } from '@/lib/utils/cn';

interface StockAdjustDialogProps {
  open: boolean;
  onClose: () => void;
  medicine: Medicine | null;
  onSuccess: () => void;
}

export default function StockAdjustDialog({ open, onClose, medicine, onSuccess }: StockAdjustDialogProps) {
  const [adjustment, setAdjustment] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAdjustment(0);
      setError(null);
    }
  }, [open]);

  if (!medicine) return null;

  const handleAdjust = async () => {
    setLoading(true);
    setError(null);
    try {
      const newQuantity = medicine.stock_quantity + adjustment;
      if (newQuantity < 0) {
        setError('Số lượng tồn kho không thể âm');
        setLoading(false);
        return;
      }
      await updateMedicineStock(medicine.id, newQuantity);
      onSuccess();
      onClose();
    } catch {
      setError('Không thể cập nhật tồn kho');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Điều chỉnh tồn kho</h3>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <HiOutlineXMark className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Thuốc: {medicine.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tồn hiện tại: <span className="font-bold">{medicine.stock_quantity}</span></p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Số lượng thay đổi</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 font-bold">{adjustment >= 0 ? '+' : ''}</span>
                  </div>
                  <input
                    type="number"
                    value={adjustment}
                    onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
                    className={cn(
                      "input-field pl-8 bg-white dark:bg-slate-900",
                      error && "border-red-500 focus:ring-red-500/20"
                    )}
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-medium italic">Nhập số dương để tăng, số âm để giảm</p>
                {error && <p className="text-xs font-medium text-red-500">{error}</p>}
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tồn kho mới: <span className="font-bold text-gray-900 dark:text-white text-base ml-1">{medicine.stock_quantity + adjustment}</span>
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleAdjust}
                disabled={loading}
                className="btn-primary min-w-[120px] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang lưu...
                  </>
                ) : (
                  'Cập nhật'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
