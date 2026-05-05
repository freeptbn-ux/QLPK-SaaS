'use client';

import React from 'react';

interface TopLocationsProps {
  data: { name: string; count: number }[];
}

export default function TopLocations({ data }: TopLocationsProps) {
  return (
    <div className="card h-full flex flex-col border-none shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
          Phân bố địa chỉ bệnh nhân
        </h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Top 20 khu vực có nhiều lượt khám nhất</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="overflow-x-auto max-h-[350px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/30 dark:bg-slate-800/30 sticky top-0 z-10 backdrop-blur-md">
              <tr className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4">Địa chỉ</th>
                <th className="px-6 py-4 text-right">Số lượt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {data.map((row, index) => (
                <tr key={index} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-300">
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-semibold group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {row.name}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-3 py-1 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-black text-xs">
                      {row.count}
                    </span>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px] italic">
                    Chưa có dữ liệu thống kê
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
