import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StatisticsClient from '../StatisticsClient';
import * as statisticsActions from '@/actions/statistics';

// Mock the actions
vi.mock('@/actions/statistics', () => ({
  getStatsByDayForMonth: vi.fn().mockResolvedValue([]),
  getRevenueStats: vi.fn().mockResolvedValue([]),
  getPatientDobsByTime: vi.fn().mockResolvedValue([]),
  getMedicineUsageStats: vi.fn().mockResolvedValue([]),
  getStatsByWeek: vi.fn().mockResolvedValue([]),
  getStatsByMonth: vi.fn().mockResolvedValue([]),
  getStatsByYear: vi.fn().mockResolvedValue([]),
}));

// Mock dayjs to have a consistent date
vi.mock('dayjs', () => {
  const dayjs = (date?: any) => ({
    format: (fmt: string) => fmt.includes('YYYY-MM') ? '2024-05' : '01/05',
    add: () => ({ format: () => '2024-05' }),
  });
  (dayjs as any).format = () => '2024-05';
  return { default: dayjs };
});

// Mock dynamic imports
vi.mock('next/dynamic', () => ({
  default: (fn: any) => {
    const Component = (props: any) => {
      return <div data-testid="chart-placeholder">{JSON.stringify(props.data || props.dobs)}</div>;
    };
    return Component;
  },
}));

describe('StatisticsClient Hydration', () => {
  const mockProps = {
    availableMonths: ['2024-05', '2024-04'],
    initialOverview: {
      totalPatients: 100,
      monthlyVisits: 20,
      monthlyRevenue: 1500,
      lowStockCount: 5,
    },
    initialGenderData: [{ name: 'Nam', value: 60 }, { name: 'Nữ', value: 40 }],
    initialLocationData: [{ name: 'Hà Nội', count: 50 }],
    initialChartData: {
      visitData: [{ name: '01/05', count: 10 }],
      revenueData: [{ name: '01/05', revenue: 500 }],
      dobData: ['1990-01-01'],
      medicineData: [{ name: 'Medicine A', totalQuantity: 10, totalRevenue: 1000 }],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should use initialChartData and NOT call fetchData on mount', async () => {
    render(<StatisticsClient {...mockProps} />);

    // Verify initial data is rendered (via placeholders)
    expect(screen.getAllByText(/01\/05/).length).toBeGreaterThan(0);
    expect(screen.getByText(/1990-01-01/)).toBeDefined();
    expect(screen.getByText(/Medicine A/)).toBeDefined();

    // Verify actions were NOT called on mount
    expect(statisticsActions.getStatsByDayForMonth).not.toHaveBeenCalled();
    expect(statisticsActions.getRevenueStats).not.toHaveBeenCalled();
    expect(statisticsActions.getPatientDobsByTime).not.toHaveBeenCalled();
    expect(statisticsActions.getMedicineUsageStats).not.toHaveBeenCalled();
  });

  it('should call fetchData when filters change', async () => {
    render(<StatisticsClient {...mockProps} />);
    
    vi.clearAllMocks();

    // Change time range to 'week'
    const weekButton = screen.getByText('Theo tuần');
    fireEvent.click(weekButton);

    // Verify actions WERE called
    await waitFor(() => {
      expect(statisticsActions.getRevenueStats).toHaveBeenCalledWith('week');
    }, { timeout: 2000 });
  });
});
