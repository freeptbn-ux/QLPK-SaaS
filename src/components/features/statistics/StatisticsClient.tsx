'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import PageHeader from '@/components/ui/PageHeader';
import { BallLoader } from '@/components/Loading';
import StatsOverview from '@/components/features/statistics/StatsOverview';
import StatsFilter from '@/components/features/statistics/StatsFilter';
import TopLocations from '@/components/features/statistics/TopLocations';
import MedicineUsageTable from '@/components/features/statistics/MedicineUsageTable';
import { 
  getStatsByDayForMonth, 
  getStatsByWeek, 
  getStatsByMonth, 
  getStatsByYear, 
  getPatientDobsByTime,
  getMedicineUsageStats,
  getRevenueStats
} from '@/actions/statistics';
import dayjs from 'dayjs';

const VisitChart = dynamic(
  () => import('@/components/features/statistics/VisitChart'),
  { ssr: false, loading: () => <div className="h-[400px] w-full flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"><BallLoader size="md" text="Đang tải biểu đồ..." /></div> }
);

const RevenueChart = dynamic(
  () => import('@/components/features/statistics/RevenueChart'),
  { ssr: false, loading: () => <div className="h-[400px] w-full flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"><BallLoader size="md" text="Đang tải dữ liệu..." /></div> }
);

const GenderPieChart = dynamic(
  () => import('@/components/features/statistics/GenderPieChart'),
  { ssr: false, loading: () => <div className="h-[400px] w-full flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"><BallLoader size="sm" text="Đang tải..." /></div> }
);

const AgeGroupChart = dynamic(
  () => import('@/components/features/statistics/AgeGroupChart'),
  { ssr: false, loading: () => <div className="h-[400px] w-full flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"><BallLoader size="sm" text="Đang tải..." /></div> }
);

interface StatisticsClientProps {
  availableMonths: string[];
  initialOverview: {
    totalPatients: number;
    monthlyVisits: number;
    monthlyRevenue: number;
    lowStockCount: number;
  } | null;
  initialGenderData: { name: string; value: number }[];
  initialLocationData: { name: string; count: number }[];
}

export default function StatisticsClient({ 
  availableMonths,
  initialOverview,
  initialGenderData,
  initialLocationData,
}: StatisticsClientProps) {
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0] || dayjs().format('YYYY-MM'));
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('day');
  
  const [overview] = useState<{
    totalPatients: number;
    monthlyVisits: number;
    monthlyRevenue: number;
    lowStockCount: number;
  } | null>(initialOverview);
  const [genderData] = useState<{ name: string; value: number }[]>(initialGenderData);
  const [locationData] = useState<{ name: string; count: number }[]>(initialLocationData);
  const [chartData, setChartData] = useState<{
    visitData: { name: string; count: number }[];
    revenueData: { name: string; revenue: number }[];
    dobData: string[];
    medicineData: { name: string; totalQuantity: number; totalRevenue: number }[];
  }>({
    visitData: [],
    revenueData: [],
    dobData: [],
    medicineData: [],
  });

  const fetchData = useCallback(async () => {
    try {
      // Time range specific data
      let visits, revenue, dobs, medicines;
      if (timeRange === 'day') {
        [visits, revenue, dobs, medicines] = await Promise.all([
          getStatsByDayForMonth(selectedMonth),
          getRevenueStats('day', selectedMonth),
          getPatientDobsByTime('month', selectedMonth),
          getMedicineUsageStats(selectedMonth),
        ]);
      } else if (timeRange === 'week') {
        [visits, revenue, dobs, medicines] = await Promise.all([
          getStatsByWeek(),
          getRevenueStats('week'),
          getPatientDobsByTime('all', ''),
          getMedicineUsageStats(),
        ]);
      } else if (timeRange === 'month') {
        [visits, revenue, dobs, medicines] = await Promise.all([
          getStatsByMonth(),
          getRevenueStats('month'),
          getPatientDobsByTime('all', ''),
          getMedicineUsageStats(),
        ]);
      } else {
        [visits, revenue, dobs, medicines] = await Promise.all([
          getStatsByYear(),
          getRevenueStats('year'),
          getPatientDobsByTime('all', ''),
          getMedicineUsageStats(),
        ]);
      }
      
      setChartData({
        visitData: visits,
        revenueData: revenue,
        dobData: dobs.filter((d: string | null): d is string => d !== null),
        medicineData: medicines,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }, [timeRange, selectedMonth]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData();
  }, [fetchData]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Thống kê báo cáo" 
        subtitle="Theo dõi tình hình hoạt động của phòng khám" 
      />
      
      <StatsOverview stats={overview} />
      
      <div className="space-y-6">
        <StatsFilter 
          availableMonths={availableMonths}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <VisitChart 
              data={chartData.visitData} 
              title={`Lượt khám ${timeRange === 'day' ? dayjs(selectedMonth).format('[Tháng] M, YYYY') : 
                timeRange === 'week' ? '8 tuần gần nhất' : 
                timeRange === 'month' ? '12 tháng gần nhất' : 'Theo năm'}`} 
            />
          </div>
          <div className="lg:col-span-4">
            <GenderPieChart data={genderData} />
          </div>
          
          <div className="lg:col-span-8">
            <RevenueChart 
              data={chartData.revenueData} 
              title={`Doanh thu ${timeRange === 'day' ? dayjs(selectedMonth).format('[Tháng] M, YYYY') : 
                timeRange === 'week' ? '8 tuần gần nhất' : 
                timeRange === 'month' ? '12 tháng gần nhất' : 'Theo năm'}`} 
            />
          </div>
          <div className="lg:col-span-4">
            <AgeGroupChart dobs={chartData.dobData} />
          </div>
          
          <div className="lg:col-span-6">
            <TopLocations data={locationData} />
          </div>
          <div className="lg:col-span-6">
            <MedicineUsageTable data={chartData.medicineData} />
          </div>
        </div>
      </div>
    </div>
  );
}
