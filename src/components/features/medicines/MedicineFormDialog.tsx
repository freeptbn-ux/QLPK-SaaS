'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineXMark } from 'react-icons/hi2';
import { Medicine } from '@/types/database';
import { medicineFormSchema, ValidatedMedicineData } from '@/lib/validations/medicine';
import { addMedicine, updateMedicine } from '@/actions/medicines';
import { cn } from '@/lib/utils/cn';
import { BallLoader } from '@/components/Loading';

interface MedicineFormDialogProps {
  open: boolean;
  onClose: () => void;
  medicine: Medicine | null;
  onSuccess: () => void;
}

export default function MedicineFormDialog({
  open,
  onClose,
  medicine,
  onSuccess,
}: MedicineFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(medicineFormSchema),
    defaultValues: {
      name: '',
      packing_spec: '',
      price: 0,
      stock_quantity: 0,
      min_stock_level: 5,
    },
  });

  useEffect(() => {
    if (medicine) {
      reset({
        name: medicine.name,
        packing_spec: medicine.packing_spec || '',
        price: medicine.price,
        stock_quantity: medicine.stock_quantity,
        min_stock_level: medicine.min_stock_level,
      });
    } else {
      reset({
        name: '',
        packing_spec: '',
        price: 0,
        stock_quantity: 0,
        min_stock_level: 5,
      });
    }
  }, [medicine, reset, open]);

  const onSubmit = async (data: ValidatedMedicineData) => {
    try {
      if (medicine) {
        await updateMedicine(medicine.id, data);
      } else {
        await addMedicine(data);
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message.includes('Dữ liệu này đã tồn tại') || err.message === 'Tên thuốc đã tồn tại') {
        setError('name', { message: 'Tên thuốc này đã tồn tại trong phòng khám của bạn' });
      } else {
        console.error('Submit error:', err);
        // Display a generic but visible error if needed
        setError('root', { message: err.message });
      }
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
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {medicine ? 'Sửa thông tin thuốc' : 'Thêm thuốc mới'}
              </h3>
              <button 
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <HiOutlineXMark className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tên thuốc</label>
                  <input
                    {...register('name')}
                    placeholder="Nhập tên thuốc..."
                    className={cn(
                      "input-field bg-white dark:bg-slate-900",
                      errors.name && "border-red-500 focus:ring-red-500/20"
                    )}
                  />
                  {errors.name && <p className="text-xs font-medium text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Quy cách đóng gói</label>
                  <input
                    {...register('packing_spec')}
                    placeholder="VD: Hộp 30 viên, Chai 100ml..."
                    className={cn(
                      "input-field bg-white dark:bg-slate-900",
                      errors.packing_spec && "border-red-500 focus:ring-red-500/20"
                    )}
                  />
                  {errors.packing_spec && <p className="text-xs font-medium text-red-500">{errors.packing_spec.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Đơn giá</label>
                    <div className="relative">
                      <input
                        {...register('price', { valueAsNumber: true })}
                        type="number"
                        className={cn(
                          "input-field pr-12 text-right bg-white dark:bg-slate-900",
                          errors.price && "border-red-500 focus:ring-red-500/20"
                        )}
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <span className="text-xs font-bold text-slate-400">VNĐ</span>
                      </div>
                    </div>
                    {errors.price && <p className="text-xs font-medium text-red-500">{errors.price.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ngưỡng cảnh báo</label>
                    <input
                      {...register('min_stock_level', { valueAsNumber: true })}
                      type="number"
                      className={cn(
                        "input-field text-right bg-white dark:bg-slate-900",
                        errors.min_stock_level && "border-red-500 focus:ring-red-500/20"
                      )}
                    />
                    <p className="text-[10px] text-slate-400 font-medium italic">Hiện cảnh báo khi tồn kho ≤ mức này</p>
                    {errors.min_stock_level && <p className="text-xs font-medium text-red-500">{errors.min_stock_level.message}</p>}
                  </div>
                </div>

                {!medicine && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Số lượng tồn kho ban đầu</label>
                    <input
                      {...register('stock_quantity', { valueAsNumber: true })}
                      type="number"
                      className={cn(
                        "input-field text-right bg-white dark:bg-slate-900",
                        errors.stock_quantity && "border-red-500 focus:ring-red-500/20"
                      )}
                    />
                    {errors.stock_quantity && <p className="text-xs font-medium text-red-500">{errors.stock_quantity.message}</p>}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary min-w-[120px] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <BallLoader size="sm" text="" className="!gap-0" />
                      Đang lưu...
                    </>
                  ) : (
                    medicine ? 'Cập nhật' : 'Thêm mới'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
