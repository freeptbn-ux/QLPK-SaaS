'use client';

import React from 'react';
import Loading from '@/components/Loading/Loading';

export default function LoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
      <Loading variant="spinner" size="xl" delay={0} />
      <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest animate-pulse">
        Đang tải hệ thống
      </p>
      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
        Vui lòng đợi trong giây lát...
      </p>
    </div>
  );
}
