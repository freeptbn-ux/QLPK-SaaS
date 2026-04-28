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
    <div className="card h-full border-none shadow-sm">
      <div className="p-6">
        <h3 className="text-base font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
          Phân bố nhóm tuổi
        </h3>
        <div className="w-full h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid vertical={false} horizontal={false} />
              <XAxis 
                type="number" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#94a3b8', fontWeight: 600 }}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                fontSize={10} 
                width={110} 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#94a3b8', fontWeight: 600 }}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc', radius: 4 }}
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                  backgroundColor: '#ffffff',
                  padding: '12px'
                }}
                itemStyle={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}
                labelStyle={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              />
              <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={16} animationDuration={1500}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#8b5cf6" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
