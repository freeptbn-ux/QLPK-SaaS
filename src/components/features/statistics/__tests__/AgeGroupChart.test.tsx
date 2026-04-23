import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import AgeGroupChart from '../AgeGroupChart';
import dayjs from 'dayjs';

// Mock Recharts because it's hard to test in JSDOM
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  BarChart: ({ data, children }: any) => <div data-testid="bar-chart" data-data={JSON.stringify(data)}>{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Cell: () => <div />,
}));

describe('AgeGroupChart', () => {
  it('groups DOBs correctly according to age rules', () => {
    // Current date is 2026-04-23
    const now = dayjs('2026-04-23');
    vi.useFakeTimers();
    vi.setSystemTime(now.toDate());

    const dobs = [
      '20/04/2026', // 3 days -> ageInMonths = 0 -> 0-2 tháng
      '01/03/2026', // ~7 weeks -> ageInMonths = 7/4.33 = 1.6 -> 0-2 tháng
      '01/01/2026', // ~3.7 months -> 2-6 tháng
      '01/01/2025', // ~15.7 months -> 6 tháng-2 tuổi
      '01/01/2022', // ~4.3 years (51 months) -> 2-6 tuổi
      '01/01/2015', // ~11.3 years (135 months) -> 6-16 tuổi
      '01/01/1990', // Adult -> Người lớn
      'invalid',    // Skip
      '12 tháng',   // Legacy - should be skipped by parseAgeParts
    ];

    render(<AgeGroupChart dobs={dobs} />);
    
    const chart = screen.getByTestId('bar-chart');
    const data = JSON.parse(chart.getAttribute('data-data') || '[]');
    
    const getCount = (name: string) => data.find((d: any) => d.name === name)?.count;

    expect(getCount('0-2 tháng')).toBe(2);
    expect(getCount('2-6 tháng')).toBe(1);
    expect(getCount('6 tháng-2 tuổi')).toBe(1);
    expect(getCount('2-6 tuổi')).toBe(1);
    expect(getCount('6-16 tuổi')).toBe(1);
    expect(getCount('Người lớn')).toBe(1);

    vi.useRealTimers();
  });

  it('renders correctly with empty dobs', () => {
    render(<AgeGroupChart dobs={[]} />);
    const chart = screen.getByTestId('bar-chart');
    const data = JSON.parse(chart.getAttribute('data-data') || '[]');
    data.forEach((group: any) => {
      expect(group.count).toBe(0);
    });
  });
});
