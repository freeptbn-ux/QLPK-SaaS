import React from 'react';
import PrescriptionSkeleton from '@/components/features/patients/PrescriptionSkeleton';

export default function PatientDetailLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        <div className="h-5 w-40 bg-gray-100 dark:bg-gray-800/50 rounded-md"></div>
      </div>

      <div className="space-y-6">
        {/* Back button skeleton */}
        <div className="h-5 w-32 bg-gray-100 dark:bg-gray-800/50 rounded-md"></div>

        {/* Info Card Skeleton */}
        <div className="card border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="h-10 flex-1 sm:w-32 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
                <div className="h-10 flex-1 sm:w-32 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Họ tên */}
              <div className="space-y-2">
                <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800/50 rounded"></div>
                <div className="h-5 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
              </div>
              {/* Giới tính */}
              <div className="space-y-2">
                <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800/50 rounded"></div>
                <div className="h-5 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
              </div>
              {/* Ngày sinh */}
              <div className="space-y-2">
                <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800/50 rounded"></div>
                <div className="h-5 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
              </div>
              {/* SĐT */}
              <div className="space-y-2">
                <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800/50 rounded"></div>
                <div className="h-5 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
              </div>
              {/* Địa chỉ */}
              <div className="space-y-2 sm:col-span-2">
                <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800/50 rounded"></div>
                <div className="h-5 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
              </div>
              {/* Cân nặng */}
              <div className="space-y-2">
                <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800/50 rounded"></div>
                <div className="h-5 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
              </div>
              {/* Chẩn đoán */}
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800/50 rounded"></div>
                <div className="h-5 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Prescription History Skeleton - Now handled by Suspense in page.tsx */}
        <PrescriptionSkeleton />
      </div>
    </div>
  );
}
