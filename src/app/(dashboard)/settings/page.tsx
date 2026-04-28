import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import SettingsForm from '@/components/features/settings/SettingsForm';
import { getAllSettings } from '@/actions/settings';

export default async function SettingsPage() {
  const initialSettings = await getAllSettings();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Cài đặt" 
        subtitle="Quản lý thông tin phòng khám và cấu hình ứng dụng" 
      />

      <SettingsForm initialSettings={initialSettings} />
    </div>
  );
}
