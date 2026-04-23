'use client';

import React from 'react';

interface TopLocationsProps {
  data: { name: string; count: number }[];
}

export default function TopLocations({ data }: TopLocationsProps) {
  return (
    <div className="card h-full flex flex-col">
      <div className="p-6 pb-2">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Top 20 khu vực / địa chỉ
        </h3>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="overflow-x-auto max-h-[350px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10">
              <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Địa chỉ</th>
                <th className="px-6 py-4 text-right">Số lượt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {data.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-3.5 text-gray-700 dark:text-gray-300 font-medium">
                    {row.name}
                  </td>
                  <td className="px-6 py-3.5 text-right font-bold text-primary-600 dark:text-primary-400">
                    {row.count}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-10 text-center text-gray-400 italic">
                    Chưa có dữ liệu
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
