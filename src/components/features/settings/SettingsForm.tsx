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
import { HiOutlineDatabase } from 'react-icons/hi';
import Loading from '@/components/Loading/Loading';

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
          <div className="card border-none shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                <HiOutlineComputerDesktop className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Thông tin phòng khám
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Cấu hình cơ bản của hệ thống</p>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                    Tên phòng khám
                  </label>
                  <input
                    {...register('clinic_name')}
                    placeholder="VD: Phòng khám Đa khoa Antigravity"
                    className={cn("input-field bg-slate-50/50 border-slate-200 focus:bg-white transition-all duration-300", errors.clinic_name && "border-red-500 focus:border-red-500")}
                  />
                  {errors.clinic_name && (
                    <p className="text-xs text-red-500 font-medium mt-1 ml-1">{errors.clinic_name.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                    Tên bác sĩ đại diện
                  </label>
                  <input
                    {...register('doctor_name')}
                    placeholder="VD: BS. Nguyễn Văn A"
                    className={cn("input-field bg-slate-50/50 border-slate-200 focus:bg-white transition-all duration-300", errors.doctor_name && "border-red-500 focus:border-red-500")}
                  />
                  {errors.doctor_name && (
                    <p className="text-xs text-red-500 font-medium mt-1 ml-1">{errors.doctor_name.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card border-none shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <HiOutlineCurrencyDollar className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Tài chính & Thanh toán
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Thiết lập các mức phí dịch vụ</p>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-1.5 max-w-sm">
                <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                  Phí khám mặc định
                </label>
                <div className="relative">
                  <input
                    type="number"
                    {...register('consultation_fee', { valueAsNumber: true })}
                    className={cn("input-field pr-16 bg-slate-50/50 border-slate-200 focus:bg-white transition-all duration-300 font-bold text-lg", errors.consultation_fee && "border-red-500 focus:border-red-500")}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    VNĐ
                  </div>
                </div>
                {errors.consultation_fee && (
                  <p className="text-xs text-red-500 font-medium mt-1 ml-1">{errors.consultation_fee.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary min-w-[200px] flex items-center justify-center gap-2 py-4 rounded-2xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all duration-500 group"
            >
              {isSubmitting ? (
                <Loading variant="spinner" size="sm" delay={0} ariaLabel="Đang lưu..." className="text-white" />
              ) : (
                <HiOutlineCheck className="w-5 h-5 group-hover:scale-125 transition-transform duration-300" />
              )}
              <span className="font-bold uppercase tracking-widest text-xs">Lưu cấu hình</span>
            </button>
          </div>
        </form>

        <div className="card border-none shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <HiOutlineComputerDesktop className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Giao diện & Trải nghiệm
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Tùy chỉnh phong cách hiển thị</p>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Chế độ tối (Dark Mode)</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tối ưu cho làm việc ban đêm</p>
              </div>
              <button
                onClick={toggleTheme}
                type="button"
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-4 ring-transparent focus:ring-primary-500/10",
                  mode === 'dark' ? "bg-primary-600" : "bg-slate-200 dark:bg-slate-700"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                    mode === 'dark' ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4">
        <div className="card border-none shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <HiOutlineKey className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Bảo mật tài khoản
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Cập nhật mật khẩu truy cập</p>
            </div>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...registerPassword('currentPassword')}
                  className={cn("input-field bg-slate-50/50 border-slate-200 focus:bg-white transition-all duration-300", passwordErrors.currentPassword && "border-red-500 focus:border-red-500")}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-xs text-red-500 font-medium mt-1 ml-1">{passwordErrors.currentPassword.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  {...registerPassword('newPassword')}
                  className={cn("input-field bg-slate-50/50 border-slate-200 focus:bg-white transition-all duration-300", passwordErrors.newPassword && "border-red-500 focus:border-red-500")}
                />
                {passwordErrors.newPassword && (
                  <p className="text-xs text-red-500 font-medium mt-1 ml-1">{passwordErrors.newPassword.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  {...registerPassword('confirmPassword')}
                  className={cn("input-field bg-slate-50/50 border-slate-200 focus:bg-white transition-all duration-300", passwordErrors.confirmPassword && "border-red-500 focus:border-red-500")}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-red-500 font-medium mt-1 ml-1">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full btn-outlined border-slate-200 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 flex items-center justify-center gap-2 mt-4 py-3 rounded-xl transition-all duration-300 font-bold uppercase tracking-widest text-[11px]"
              >
                {isChangingPassword ? (
                  <Loading variant="spinner" size="sm" delay={0} ariaLabel="Đang đổi mật khẩu..." className="text-primary-600" />
                ) : null}
                Đổi mật khẩu truy cập
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
