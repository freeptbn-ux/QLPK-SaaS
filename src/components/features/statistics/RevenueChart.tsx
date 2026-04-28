'use client';

import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

interface RevenueChartProps {
  data: { name: string; revenue: number }[];
  title: string;
}

export default function RevenueChart({ data, title }: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  return (
    <div className="card h-full border-none shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {title}
          </h3>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Doanh thu</span>
          </div>
        </div>
        <div className="w-full h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
                tickFormatter={formatCurrency}
                tick={{ fill: '#94a3b8', fontWeight: 600 }}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                  backgroundColor: '#ffffff',
                  padding: '12px'
                }}
                itemStyle={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}
                labelStyle={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [Number(value || 0).toLocaleString('vi-VN') + ' đ', 'Doanh thu']}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                strokeWidth={4}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
