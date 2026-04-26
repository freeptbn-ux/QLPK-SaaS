'use client';

import React from 'react';
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

interface VisitChartProps {
  data: { name: string; count: number }[];
  title: string;
}

export default function VisitChart({ data, title }: VisitChartProps) {
  return (
    <div className="card h-full">
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          {title}
        </h3>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
              <XAxis 
                dataKey="name" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis 
                fontSize={11} 
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
                cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={1500}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#3b82f6" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
