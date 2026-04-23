import React from 'react';
import SettingsForm from '@/components/features/settings/SettingsForm';
import { getAllSettings } from '@/actions/settings';

export default async function SettingsPage() {
  const initialSettings = await getAllSettings();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Cài đặt
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Quản lý thông tin phòng khám và cấu hình ứng dụng
        </p>
      </div>

      <SettingsForm initialSettings={initialSettings} />
    </div>
  );
}
