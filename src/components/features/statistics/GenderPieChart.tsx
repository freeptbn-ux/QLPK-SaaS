'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface GenderPieChartProps {
  data: { name: string; value: number }[];
}

const COLORS = ['#3b82f6', '#f43f5e', '#eab308', '#10b981'];

export default function GenderPieChart({ data }: GenderPieChartProps) {
  return (
    <div className="card h-full border-none shadow-sm">
      <div className="p-6">
        <h3 className="text-base font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
          Phân bố giới tính
        </h3>
        <div className="w-full h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={8}
                dataKey="value"
                animationDuration={1500}
                stroke="none"
                cornerRadius={4}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                  backgroundColor: '#ffffff',
                  padding: '12px'
                }}
                itemStyle={{ fontSize: '12px', fontWeight: 700 }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
