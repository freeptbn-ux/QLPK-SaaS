'use client';

import React, { useEffect } from 'react';
import { HiOutlineExclamationTriangle, HiOutlineArrowPath } from 'react-icons/hi2';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Medicines Page Error:', error);
  }, [error]);

  // Handle Firefox specific "Error in input stream"
  const isFirefoxStreamError = error.message?.includes('input stream') || 
                               error.message?.includes('stream');

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
        <HiOutlineExclamationTriangle className="w-10 h-10 text-red-500" />
      </div>
      
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        {isFirefoxStreamError ? 'Lỗi kết nối dữ liệu' : 'Đã có lỗi xảy ra'}
      </h2>
      
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        {isFirefoxStreamError 
          ? 'Luồng dữ liệu bị gián đoạn (thường gặp trên Firefox). Đừng lo lắng, dữ liệu của bạn vẫn an toàn.'
          : 'Hệ thống gặp sự cố khi tải danh mục thuốc. Vui lòng thử lại hoặc liên hệ quản trị viên.'}
      </p>
      
      <button
        onClick={() => reset()}
        className="btn-primary flex items-center gap-2 px-8"
      >
        <HiOutlineArrowPath className="w-5 h-5" />
        Thử lại ngay
      </button>
      
      <div className="mt-8 text-xs text-slate-400 font-mono bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
        Error ID: {error.digest || 'N/A'}
      </div>
    </div>
  );
}
