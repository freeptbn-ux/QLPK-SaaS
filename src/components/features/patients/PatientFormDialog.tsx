'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineInformationCircle, HiOutlineXMark } from 'react-icons/hi2';
import { patientSchema, PatientSchemaType } from '@/lib/validations/patient';
import { Patient } from '@/types/database';
import { addPatient, updatePatient } from '@/actions/patients';
import { useToast } from '@/hooks/useToast';
import DateInput from '@/components/ui/DateInput';
import { cn } from '@/lib/utils/cn';

interface PatientFormDialogProps {
  open: boolean;
  onClose: () => void;
  patient?: Patient | null;
  onSuccess: () => void;
}

export default function PatientFormDialog({
  open,
  onClose,
  patient,
  onSuccess,
}: PatientFormDialogProps) {
  const isEdit = !!patient;
  const { showToast } = useToast();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientSchemaType>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      dob: '',
      gender: 'Nam',
      address: '',
      phone: '',
      weight: '',
      diagnosis: '',
    },
  });

  useEffect(() => {
    if (patient && open) {
      const isOldFormat = patient.dob && !/^\d{2}\/\d{2}\/\d{4}$/.test(patient.dob);
      reset({
        name: patient.name || '',
        dob: isOldFormat ? '' : (patient.dob || ''),
        gender: (patient.gender as 'Nam' | 'Nữ' | '') || 'Nam',
        address: patient.address || '',
        phone: patient.phone || '',
        weight: patient.weight || '',
        diagnosis: patient.diagnosis || '',
      });
    } else if (!patient && open) {
      reset({
        name: '',
        dob: '',
        gender: 'Nam',
        address: '',
        phone: '',
        weight: '',
        diagnosis: '',
      });
    }
  }, [patient, open, reset]);

  const onSubmit = async (data: PatientSchemaType) => {
    try {
      if (isEdit && patient) {
        await updatePatient(patient.id, data);
        showToast('Cập nhật bệnh nhân thành công', 'success');
      } else {
        const result = await addPatient(data);
        if (result.isExisting) {
          showToast('Bệnh nhân đã tồn tại trong hệ thống, đã cập nhật thông tin.', 'info');
        } else {
          showToast('Thêm bệnh nhân thành công', 'success');
        }
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving patient:', error);
      showToast('Có lỗi xảy ra khi lưu thông tin', 'error');
    }
  };

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
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
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEdit ? 'Cập nhật thông tin bệnh nhân' : 'Thêm bệnh nhân mới'}
              </h3>
              <button 
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <HiOutlineXMark className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto max-h-[calc(100vh-200px)]">
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name - Full Width */}
                  <div className="sm:col-span-2">
                    <label htmlFor="patient-name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="patient-name"
                          className={cn(
                            "input-field",
                            errors.name && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          )}
                          placeholder="Nguyễn Văn A"
                        />
                      )}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  {/* DOB */}
                  <div>
                    <Controller
                      name="dob"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <DateInput
                            value={field.value || ''}
                            onChange={field.onChange}
                            label="Ngày sinh"
                            error={!!errors.dob}
                            helperText={errors.dob?.message}
                          />
                          {patient && patient.dob && !/^\d{2}\/\d{2}\/\d{4}$/.test(patient.dob) && (
                            <div className="mt-2 flex items-center gap-1.5 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                              <HiOutlineInformationCircle className="w-4 h-4 text-amber-600" />
                              <p className="text-xs text-amber-700 dark:text-amber-400">
                                Format cũ: &quot;{patient.dob}&quot;. Vui lòng nhập lại.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Giới tính
                    </label>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center gap-6 pt-2">
                          {['Nam', 'Nữ'].map((option) => (
                            <label key={option} className="flex items-center gap-2 cursor-pointer group">
                              <input
                                type="radio"
                                className="w-5 h-5 text-primary-600 border-gray-300 focus:ring-primary-500 dark:border-gray-700 dark:bg-slate-800"
                                value={option}
                                checked={field.value === option}
                                onChange={() => field.onChange(option)}
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary-600 transition-colors">
                                {option}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="patient-phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Số điện thoại
                    </label>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="patient-phone"
                          className="input-field"
                          placeholder="0123 456 789"
                        />
                      )}
                    />
                  </div>

                  {/* Weight */}
                  <div>
                    <label htmlFor="patient-weight" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Cân nặng (kg)
                    </label>
                    <Controller
                      name="weight"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="patient-weight"
                          className="input-field"
                          placeholder="VD: 60"
                        />
                      )}
                    />
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label htmlFor="patient-address" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Địa chỉ
                    </label>
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          id="patient-address"
                          rows={2}
                          className="input-field resize-none"
                          placeholder="Số nhà, đường, phường/xã..."
                        />
                      )}
                    />
                  </div>

                  {/* Diagnosis */}
                  <div className="sm:col-span-2">
                    <label htmlFor="patient-diagnosis" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Chẩn đoán / Ghi chú
                    </label>
                    <Controller
                      name="diagnosis"
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          id="patient-diagnosis"
                          rows={3}
                          className="input-field resize-none"
                          placeholder="Chẩn đoán ban đầu hoặc ghi chú đặc biệt về bệnh nhân..."
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary min-w-[100px] flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                       <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang lưu...
                    </div>
                  ) : 'Lưu'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
