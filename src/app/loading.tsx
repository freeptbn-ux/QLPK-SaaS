import React from 'react';
import { CgSpinner } from 'react-icons/cg';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 gap-4">
      <div className="relative">
        <CgSpinner className="w-16 h-16 text-blue-600 dark:text-blue-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-blue-600 dark:bg-blue-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      <p className="text-xl font-bold text-slate-600 dark:text-slate-400 animate-pulse tracking-wide">
        Đang tải...
      </p>
    </div>
  );
}
