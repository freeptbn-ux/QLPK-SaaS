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
    <div className="card h-full border-none shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {title}
          </h3>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-primary-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lượt khám</span>
          </div>
        </div>
        <div className="w-full h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" strokeDasharray="4" />
              <XAxis 
                dataKey="name" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#94a3b8', fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#94a3b8', fontWeight: 600 }}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc', radius: 8 }}
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
              <Bar 
                dataKey="count" 
                radius={[6, 6, 6, 6]} 
                animationDuration={1500}
                barSize={data.length > 20 ? 8 : 32}
              >
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
