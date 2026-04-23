import React from 'react';
import Link from 'next/link';
import { HiHome, HiQuestionMarkCircle } from 'react-icons/hi2';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <HiQuestionMarkCircle className="w-16 h-16 text-blue-600 dark:text-blue-500" />
          </div>
        </div>
        
        <h1 className="text-8xl font-black text-blue-600 dark:text-blue-500 mb-4 tracking-tighter">
          404
        </h1>
        
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Không tìm thấy trang
        </h2>
        
        <p className="text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển. Vui lòng kiểm tra lại đường dẫn.
        </p>

        <Link 
          href="/" 
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/25 active:scale-95"
        >
          <HiHome className="w-6 h-6" />
          Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
}
