'use client';

import React from 'react';
import { HiExclamationTriangle, HiArrowPath } from 'react-icons/hi2';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center p-8 min-h-[60vh]">
      <div className="p-10 text-center max-w-lg w-full bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-3xl shadow-xl">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
            <HiExclamationTriangle className="w-12 h-12 text-error" />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-foreground dark:text-white mb-3">
          Lỗi tải dữ liệu
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          Chúng tôi gặp sự cố khi tải nội dung này. Bạn có thể thử tải lại hoặc liên hệ quản trị viên nếu sự cố tiếp diễn.
        </p>
        <button
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 mx-auto px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary-600/25 active:scale-95"
        >
          <HiArrowPath className="w-5 h-5" />
          Tải lại trang
        </button>
      </div>
    </div>
  );
}
