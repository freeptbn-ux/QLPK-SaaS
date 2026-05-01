import React from 'react';
import Loading from '@/components/Loading/Loading';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 w-full">
      <Loading variant="spinner" size="lg" className="text-primary-600" />
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
        Đang tải dữ liệu...
      </p>
    </div>
  );
}
