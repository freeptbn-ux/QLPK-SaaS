import React from 'react';
import PageHeader from '@/components/ui/PageHeader';

export default function PatientsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bệnh nhân"
        subtitle="Quản lý danh sách hồ sơ và lịch sử khám của bệnh nhân"
      />
      
      {/* Search and actions bar skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 animate-pulse">
        <div className="h-10 w-full sm:w-80 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="h-10 w-full sm:w-28 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          <div className="h-10 w-full sm:w-36 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        </div>
      </div>

      {/* List skeleton */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border-b border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0"></div>
              <div className="space-y-2 flex-1">
                <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
              </div>
            </div>
            <div className="flex flex-col sm:items-end gap-2 shrink-0">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
