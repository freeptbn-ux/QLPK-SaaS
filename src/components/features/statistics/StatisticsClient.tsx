'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import StatsOverview from '@/components/features/statistics/StatsOverview';
import StatsFilter from '@/components/features/statistics/StatsFilter';
import VisitChart from '@/components/features/statistics/VisitChart';
import RevenueChart from '@/components/features/statistics/RevenueChart';
import GenderPieChart from '@/components/features/statistics/GenderPieChart';
import AgeGroupChart from '@/components/features/statistics/AgeGroupChart';
import TopLocations from '@/components/features/statistics/TopLocations';
import MedicineUsageTable from '@/components/features/statistics/MedicineUsageTable';
import { 
  getOverviewStats, 
  getStatsByDayForMonth, 
  getStatsByWeek, 
  getStatsByMonth, 
  getStatsByYear, 
  getStatsByGender, 
  getStatsByLocation,
  getPatientDobsByTime,
  getMedicineUsageStats,
  getRevenueStats
} from '@/actions/statistics';
import dayjs from 'dayjs';

interface StatisticsClientProps {
  availableMonths: string[];
}

export default function StatisticsClient({ availableMonths }: StatisticsClientProps) {
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0] || dayjs().format('YYYY-MM'));
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('day');
  
  const [overview, setOverview] = useState<{
    totalPatients: number;
    monthlyVisits: number;
    monthlyRevenue: number;
    lowStockCount: number;
  } | null>(null);
  const [visitData, setVisitData] = useState<{ name: string; count: number }[]>([]);
  const [revenueData, setRevenueData] = useState<{ name: string; revenue: number }[]>([]);
  const [genderData, setGenderData] = useState<{ name: string; value: number }[]>([]);
  const [dobData, setDobData] = useState<string[]>([]);
  const [locationData, setLocationData] = useState<{ name: string; count: number }[]>([]);
  const [medicineData, setMedicineData] = useState<{ name: string; totalQuantity: number; totalRevenue: number }[]>([]);
  const [, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, gender, locations] = await Promise.all([
        getOverviewStats(),
        getStatsByGender(),
        getStatsByLocation(),
      ]);
      setOverview(ov);
      setGenderData(gender);
      setLocationData(locations);

      // Time range specific data
      let visits, revenue, dobs, medicines;
      if (timeRange === 'day') {
        [visits, revenue, dobs, medicines] = await Promise.all([
          getStatsByDayForMonth(selectedMonth),
          getRevenueStats(selectedMonth),
          getPatientDobsByTime('month', selectedMonth),
          getMedicineUsageStats(selectedMonth),
        ]);
      } else if (timeRange === 'week') {
        [visits, revenue, dobs, medicines] = await Promise.all([
          getStatsByWeek(),
          getRevenueStats(),
          getPatientDobsByTime('all', ''),
          getMedicineUsageStats(),
        ]);
      } else if (timeRange === 'month') {
        [visits, revenue, dobs, medicines] = await Promise.all([
          getStatsByMonth(),
          getRevenueStats(),
          getPatientDobsByTime('all', ''),
          getMedicineUsageStats(),
        ]);
      } else {
        [visits, revenue, dobs, medicines] = await Promise.all([
          getStatsByYear(),
          getRevenueStats(),
          getPatientDobsByTime('all', ''),
          getMedicineUsageStats(),
        ]);
      }
      setVisitData(visits);
      setRevenueData(revenue);
      setDobData(dobs.filter((d): d is string => d !== null));
      setMedicineData(medicines);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange, selectedMonth]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
              data={visitData} 
              title={`Lượt khám ${timeRange === 'day' ? `tháng ${selectedMonth}` : 
                timeRange === 'week' ? '8 tuần gần nhất' : 
                timeRange === 'month' ? '12 tháng gần nhất' : 'Theo năm'}`} 
            />
          </div>
          <div className="lg:col-span-4">
            <GenderPieChart data={genderData} />
          </div>
          
          <div className="lg:col-span-8">
            <RevenueChart 
              data={revenueData} 
              title="Doanh thu (Đơn thuốc + Phí khám)" 
            />
          </div>
          <div className="lg:col-span-4">
            <AgeGroupChart dobs={dobData} />
          </div>
          
          <div className="lg:col-span-6">
            <TopLocations data={locationData} />
          </div>
          <div className="lg:col-span-6">
            <MedicineUsageTable data={medicineData} />
          </div>
        </div>
      </div>
    </div>
  );
}
