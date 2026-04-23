'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { HiOutlineCheck, HiOutlineKey, HiOutlineComputerDesktop, HiOutlineCurrencyDollar } from 'react-icons/hi2';
import { useToast } from '@/hooks/useToast';
import { updateMultipleSettings, changePassword } from '@/actions/settings';
import { useThemeContext } from '@/theme/ThemeContext';
import { cn } from '@/lib/utils/cn';

const settingsSchema = z.object({
  clinic_name: z.string().min(1, 'Tên phòng khám là bắt buộc'),
  doctor_name: z.string().min(1, 'Tên bác sĩ là bắt buộc'),
  consultation_fee: z.number().min(0, 'Phí khám không được âm'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mật khẩu hiện tại là bắt buộc'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().min(6, 'Xác nhận mật khẩu phải có ít nhất 6 ký tự'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

type SettingsValues = z.infer<typeof settingsSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

interface SettingsFormProps {
  initialSettings: Record<string, string>;
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const { showToast } = useToast();
  const { mode, toggleTheme } = useThemeContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      clinic_name: initialSettings.clinic_name || '',
      doctor_name: initialSettings.doctor_name || '',
      consultation_fee: Number(initialSettings.consultation_fee) || 0,
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSettingsSubmit = async (data: SettingsValues) => {
    const values = data;
    setIsSubmitting(true);
    try {
      await updateMultipleSettings({
        clinic_name: values.clinic_name,
        doctor_name: values.doctor_name,
        consultation_fee: values.consultation_fee.toString(),
      });
      showToast('Cập nhật cài đặt thành công', 'success');
    } catch {
      showToast('Lỗi khi cập nhật cài đặt', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordValues) => {
    setIsChangingPassword(true);
    try {
      await changePassword(data.currentPassword, data.newPassword);
      showToast('Đổi mật khẩu thành công', 'success');
      resetPassword();
    } catch (error: unknown) {
      const err = error as Error;
      showToast(err.message || 'Lỗi khi đổi mật khẩu', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-6">
        <form onSubmit={handleSubmit(onSettingsSubmit)} className="space-y-6">
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <HiOutlineComputerDesktop className="w-5 h-5 text-primary-600" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Thông tin phòng khám
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Tên phòng khám
                  </label>
                  <input
                    {...register('clinic_name')}
                    className={cn("input-field", errors.clinic_name && "border-red-500 focus:border-red-500")}
                  />
                  {errors.clinic_name && (
                    <p className="text-xs text-red-500 font-medium">{errors.clinic_name.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Tên bác sĩ
                  </label>
                  <input
                    {...register('doctor_name')}
                    className={cn("input-field", errors.doctor_name && "border-red-500 focus:border-red-500")}
                  />
                  {errors.doctor_name && (
                    <p className="text-xs text-red-500 font-medium">{errors.doctor_name.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <HiOutlineCurrencyDollar className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Tài chính
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-1.5 max-w-xs">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Phí khám mặc định
                </label>
                <div className="relative">
                  <input
                    type="number"
                    {...register('consultation_fee', { valueAsNumber: true })}
                    className={cn("input-field pr-12", errors.consultation_fee && "border-red-500 focus:border-red-500")}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                    VNĐ
                  </div>
                </div>
                {errors.consultation_fee && (
                  <p className="text-xs text-red-500 font-medium">{errors.consultation_fee.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary min-w-[160px] flex items-center justify-center gap-2 py-3"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <HiOutlineCheck className="w-5 h-5" />
              )}
              Lưu thay đổi
            </button>
          </div>
        </form>

        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Giao diện & Trải nghiệm
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-gray-900 dark:text-white">Chế độ hiển thị</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Chuyển đổi giữa giao diện sáng và tối</p>
              </div>
              <button
                onClick={toggleTheme}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-transparent focus:ring-primary-500/20",
                  mode === 'dark' ? "bg-primary-600" : "bg-gray-200 dark:bg-gray-700"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    mode === 'dark' ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4">
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <HiOutlineKey className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Bảo mật
            </h3>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  {...registerPassword('currentPassword')}
                  className={cn("input-field", passwordErrors.currentPassword && "border-red-500 focus:border-red-500")}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-xs text-red-500 font-medium">{passwordErrors.currentPassword.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  {...registerPassword('newPassword')}
                  className={cn("input-field", passwordErrors.newPassword && "border-red-500 focus:border-red-500")}
                />
                {passwordErrors.newPassword && (
                  <p className="text-xs text-red-500 font-medium">{passwordErrors.newPassword.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  {...registerPassword('confirmPassword')}
                  className={cn("input-field", passwordErrors.confirmPassword && "border-red-500 focus:border-red-500")}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-red-500 font-medium">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full btn-outlined flex items-center justify-center gap-2 mt-2"
              >
                {isChangingPassword ? (
                  <svg className="animate-spin h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                Cập nhật mật khẩu
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
