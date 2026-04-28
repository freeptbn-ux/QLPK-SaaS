'use client';

import React from 'react';
import { HiOutlineUsers, HiOutlineDocumentText, HiOutlineBanknotes, HiOutlineExclamationTriangle } from 'react-icons/hi2';

interface StatsOverviewProps {
  stats: {
    totalPatients: number;
    monthlyVisits: number;
    monthlyRevenue: number;
    lowStockCount: number;
  } | null;
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const items = [
    {
      title: 'Tổng bệnh nhân',
      value: stats?.totalPatients ?? 0,
      icon: HiOutlineUsers,
      colorClass: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
    },
    {
      title: 'Lượt khám tháng này',
      value: stats?.monthlyVisits ?? 0,
      icon: HiOutlineDocumentText,
      colorClass: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Doanh thu tháng này',
      value: (stats?.monthlyRevenue ?? 0).toLocaleString('vi-VN') + ' đ',
      icon: HiOutlineBanknotes,
      colorClass: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Thuốc sắp hết',
      value: stats?.lowStockCount ?? 0,
      icon: HiOutlineExclamationTriangle,
      colorClass: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item, index) => (
        <div key={index} className="card group hover:shadow-xl transition-all duration-500 border-none bg-white dark:bg-slate-900/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <item.icon className="w-20 h-20 -mr-4 -mt-4 rotate-12" />
          </div>
          <div className="p-6 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className={`p-3 rounded-2xl inline-flex ${item.colorClass} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                    {item.title}
                  </span>
                  <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {stats ? item.value : <div className="h-10 w-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
