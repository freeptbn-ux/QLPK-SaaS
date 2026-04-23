'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { parseAgeParts } from '@/lib/utils/age';

interface AgeGroupChartProps {
  dobs: string[];
}

export default function AgeGroupChart({ dobs }: AgeGroupChartProps) {
  const chartData = useMemo(() => {
    const groups = {
      '0-2 tháng': 0,
      '2-6 tháng': 0,
      '6 tháng-2 tuổi': 0,
      '2-6 tuổi': 0,
      '6-16 tuổi': 0,
      'Người lớn': 0,
    };

    dobs.forEach((dob) => {
      const parts = parseAgeParts(dob);
      if (!parts) return; // Skip invalid/legacy DOBs

      // Convert to months for grouping consistent with original logic
      let ageInMonths: number;
      switch (parts.unit) {
        case 'day':
          ageInMonths = 0;
          break;
        case 'week':
          ageInMonths = parts.value / 4.33;
          break;
        case 'month':
          ageInMonths = parts.value;
          break;
        case 'year':
          ageInMonths = parts.value * 12;
          break;
        default:
          return;
      }

      if (ageInMonths <= 2) groups['0-2 tháng']++;
      else if (ageInMonths <= 6) groups['2-6 tháng']++;
      else if (ageInMonths <= 24) groups['6 tháng-2 tuổi']++;
      else if (ageInMonths <= 72) groups['2-6 tuổi']++;
      else if (ageInMonths <= 192) groups['6-16 tuổi']++;
      else groups['Người lớn']++;
    });

    return Object.entries(groups).map(([name, count]) => ({ name, count }));
  }, [dobs]);

  return (
    <div className="card h-full">
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Phân bố nhóm tuổi
        </h3>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
              <XAxis 
                type="number" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                fontSize={11} 
                width={110} 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#9ca3af' }}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  padding: '12px'
                }}
                cursor={{ fill: 'rgba(168, 85, 247, 0.05)' }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20} animationDuration={1500}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#a855f7" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
