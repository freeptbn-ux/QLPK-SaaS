'use client';

import React from 'react';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Tabs, 
  Tab, 
  Paper,
  Stack
} from '@mui/material';

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
  return (
    <Paper sx={{ p: 2, mb: 3, borderRadius: 4 }} elevation={1}>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Tabs 
          value={timeRange} 
          onChange={(_, val) => onTimeRangeChange(val)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Theo ngày" value="day" />
          <Tab label="Theo tuần" value="week" />
          <Tab label="Theo tháng" value="month" />
          <Tab label="Theo năm" value="year" />
        </Tabs>

        {timeRange === 'day' && (
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Chọn tháng/năm</InputLabel>
            <Select
              value={selectedMonth}
              label="Chọn tháng/năm"
              onChange={(e) => onMonthChange(e.target.value)}
            >
              {availableMonths.map((m) => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>
    </Paper>
  );
}
