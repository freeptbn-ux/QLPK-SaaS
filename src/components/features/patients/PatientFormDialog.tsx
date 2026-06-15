'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineInformationCircle, HiOutlineXMark } from 'react-icons/hi2';
import { patientFormSchema, ValidatedPatientData } from '@/lib/validations/patient';
import { Patient } from '@/types/database';
import { addPatient, updatePatient } from '@/actions/patients';
import { useToast } from '@/hooks/useToast';
import DateInput from '@/components/ui/DateInput';
import { cn } from '@/lib/utils/cn';
import { formatDobForInput } from '@/lib/utils/age';
import { BallLoader } from '@/components/Loading';

function toTitleCase(str: string): string {
  if (!str) return str;
  return str.toLowerCase().replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());
}

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
  const router = useRouter();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(patientFormSchema),
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
      reset({
        name: patient.name || '',
        dob: formatDobForInput(patient.dob || ''),
        gender: (patient.gender as 'Nam' | 'Nữ') || 'Nam',
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

  const onSubmit = async (data: ValidatedPatientData) => {
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
        if (result.data?.id) {
          router.push(`/patients/${result.data.id}`);
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
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {isEdit ? 'Cập nhật thông tin bệnh nhân' : 'Thêm bệnh nhân mới'}
              </h3>
              <button 
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <HiOutlineXMark className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto max-h-[calc(100vh-200px)]">
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name - Full Width */}
                  <div className="sm:col-span-2">
                    <label htmlFor="patient-name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          onChange={(e) => field.onChange(toTitleCase(e.target.value))}
                          id="patient-name"
                          autoComplete="off"
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
                            required
                            error={!!errors.dob}
                            helperText={errors.dob?.message}
                          />
                          {patient && patient.dob && !formatDobForInput(patient.dob) && (
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
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Giới tính <span className="text-red-500">*</span>
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
                                className="w-5 h-5 text-primary-600 border-slate-300 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800"
                                value={option}
                                checked={field.value === option}
                                onChange={() => field.onChange(option)}
                              />
                              <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-primary-600 transition-colors">
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
                    <label htmlFor="patient-phone" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="patient-phone"
                          autoComplete="off"
                          className={cn(
                            "input-field",
                            errors.phone && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          )}
                          placeholder="0123 456 789"
                        />
                      )}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* Weight */}
                  <div>
                    <label htmlFor="patient-weight" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Cân nặng (kg)
                    </label>
                    <Controller
                      name="weight"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="patient-weight"
                          autoComplete="off"
                          className="input-field"
                          placeholder="VD: 60"
                        />
                      )}
                    />
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label htmlFor="patient-address" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Địa chỉ
                    </label>
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          id="patient-address"
                          autoComplete="off"
                          rows={2}
                          className="input-field resize-none"
                          placeholder="Số nhà, đường, phường/xã..."
                        />
                      )}
                    />
                  </div>

                  {/* Diagnosis */}
                  <div className="sm:col-span-2">
                    <label htmlFor="patient-diagnosis" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Chẩn đoán / Ghi chú
                    </label>
                    <Controller
                      name="diagnosis"
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          id="patient-diagnosis"
                          autoComplete="off"
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
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all disabled:opacity-50"
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
                       <BallLoader size="sm" text="" className="!gap-0" />
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
