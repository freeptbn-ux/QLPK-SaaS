'use client';

import React from 'react';
import { 
  HiMoon, 
  HiSun,
  HiCheckCircle,
  HiExclamationCircle
} from 'react-icons/hi2';
import { useThemeContext } from '@/theme/ThemeContext';
import Link from 'next/link';

export default function Home() {
  const { mode, toggleTheme, mounted } = useThemeContext();

  const hasSupabaseKeys = 
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && 
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="bg-white dark:bg-slate-900 shadow-xl rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-all duration-300">
          <div className={`p-8 md:p-12 text-center relative ${
            mounted && mode === 'light' 
              ? 'bg-gradient-to-br from-white to-slate-50'
              : mounted && mode === 'dark'
                ? 'bg-gradient-to-br from-slate-900 to-slate-950'
                : 'bg-white dark:bg-slate-900'
          }`}>
            <div className="absolute top-6 right-6">
              <button 
                onClick={toggleTheme}
                className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title={mounted ? `Switch to ${mode === 'light' ? 'dark' : 'light'} mode` : 'Loading...'}
              >
                {mounted ? (
                  mode === 'dark' ? <HiSun className="w-6 h-6" /> : <HiMoon className="w-6 h-6" />
                ) : (
                  <div className="w-6 h-6" />
                )}
              </button>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
              QLPK <span className="text-blue-600 dark:text-blue-400">SaaS</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
              Hệ thống quản lý phòng khám Nhi khoa thông minh, hiện đại và hiệu quả.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link 
                href="/login"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1 active:translate-y-0"
              >
                Bắt đầu ngay
              </Link>
              <button className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                Tài liệu hướng dẫn
              </button>
            </div>

            <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">
                Trạng thái hệ thống
              </h2>
              <div className="flex flex-wrap justify-center gap-8">
                <div className="flex items-center gap-2">
                  <HiCheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Tailwind CSS: Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasSupabaseKeys ? (
                    <HiCheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <HiExclamationCircle className="w-5 h-5 text-amber-500" />
                  )}
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Supabase: {hasSupabaseKeys ? 'Configured' : 'Missing Keys'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
