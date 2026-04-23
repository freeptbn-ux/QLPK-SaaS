'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
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
import dayjs from 'dayjs';

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

    const now = dayjs();

    dobs.forEach((dob) => {
      let ageInMonths = 0;
      
      // Handle "13 tháng" format or ISO date
      if (dob.toLowerCase().includes('tháng')) {
        const months = parseInt(dob);
        if (!isNaN(months)) ageInMonths = months;
      } else {
        const birthDate = dayjs(dob);
        if (birthDate.isValid()) {
          ageInMonths = now.diff(birthDate, 'month');
        }
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
    <Card elevation={2} sx={{ borderRadius: 4, height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Phân bố nhóm tuổi
        </Typography>
        <Box sx={{ width: '100%', height: 300, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" fontSize={11} width={100} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                cursor={{ fill: '#f5f5f5' }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#ab47bc" fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
