'use client';

import React from 'react';

interface MedicineUsageTableProps {
  data: { name: string; totalQuantity: number; totalRevenue: number }[];
}

export default function MedicineUsageTable({ data }: MedicineUsageTableProps) {
  return (
    <div className="card h-full flex flex-col border-none shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
          Thuốc sử dụng nhiều nhất
        </h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Top danh sách thuốc kê đơn nhiều nhất</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="overflow-x-auto max-h-[350px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/30 dark:bg-slate-800/30 sticky top-0 z-10 backdrop-blur-md">
              <tr className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4">Tên thuốc</th>
                <th className="px-6 py-4 text-right">Tổng SL</th>
                <th className="px-6 py-4 text-right">Tổng doanh thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {data.map((row, index) => (
                <tr key={index} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-300">
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-bold group-hover:text-primary-600 transition-colors">
                    {row.name}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-black text-slate-900 dark:text-white">{row.totalQuantity}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                    {row.totalRevenue.toLocaleString('vi-VN')} đ
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px] italic">
                    Chưa có dữ liệu kê đơn
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
