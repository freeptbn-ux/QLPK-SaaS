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
        <div key={index} className="card group hover:shadow-lg transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {item.title}
                </span>
                <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  {stats ? item.value : <div className="h-8 w-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />}
                </div>
              </div>
              <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300 ${item.colorClass}`}>
                <item.icon className="w-7 h-7" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
