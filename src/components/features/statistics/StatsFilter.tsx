'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

interface StatsFilterProps {
  availableMonths: string[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  timeRange: 'day' | 'week' | 'month' | 'year';
  onTimeRangeChange: (range: 'day' | 'week' | 'month' | 'year') => void;
}

export default function StatsFilter({
  availableMonths,
  selectedMonth,
  onMonthChange,
  timeRange,
  onTimeRangeChange,
}: StatsFilterProps) {
  const tabs = [
    { label: 'Theo ngày', value: 'day' },
    { label: 'Theo tuần', value: 'week' },
    { label: 'Theo tháng', value: 'month' },
    { label: 'Theo năm', value: 'year' },
  ];

  return (
    <div className="card mb-6">
      <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-full sm:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onTimeRangeChange(tab.value as 'day' | 'week' | 'month' | 'year')}
              className={cn(
                "flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-lg transition-all",
                timeRange === tab.value
                  ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {timeRange === 'day' && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
              Tháng/Năm:
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="input-field py-2 pr-10 text-sm font-medium w-full sm:w-48"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
