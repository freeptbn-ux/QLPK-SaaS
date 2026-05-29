'use client';

import React, { useEffect } from 'react';
import { HiExclamationTriangle, HiArrowPath, HiHome } from 'react-icons/hi2';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
            <HiExclamationTriangle className="w-12 h-12 text-red-600 dark:text-red-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
          Đã có lỗi xảy ra!
        </h1>
        
        <p className="text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
          {error.message || 'Một lỗi không mong muốn đã xảy ra. Vui lòng thử lại hoặc quay về trang chủ.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/25"
          >
            <HiArrowPath className="w-5 h-5" />
            Thử lại
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            <HiHome className="w-5 h-5" />
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
