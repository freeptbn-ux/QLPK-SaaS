'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Grid, Typography, Box, Skeleton } from '@mui/material';
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
  
  const [overview, setOverview] = useState<any>(null);
  const [visitData, setVisitData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [genderData, setGenderData] = useState<any[]>([]);
  const [dobData, setDobData] = useState<string[]>([]);
  const [locationData, setLocationData] = useState<any[]>([]);
  const [medicineData, setMedicineData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      setDobData(dobs);
      setMedicineData(medicineData.length > 0 ? medicineData : medicines); // Keep medicine data if already fetched or update
      setMedicineData(medicines);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange, selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <PageHeader title="Thống kê báo cáo" subtitle="Theo dõi tình hình hoạt động của phòng khám" />
      
      <StatsOverview stats={overview} />
      
      <Box sx={{ mt: 4 }}>
        <StatsFilter 
          availableMonths={availableMonths}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
        
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <VisitChart 
              data={visitData} 
              title={`Lượt khám ${timeRange === 'day' ? `tháng ${selectedMonth}` : 
                timeRange === 'week' ? '8 tuần gần nhất' : 
                timeRange === 'month' ? '12 tháng gần nhất' : 'Theo năm'}`} 
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <GenderPieChart data={genderData} />
          </Grid>
          
          <Grid size={{ xs: 12, md: 8 }}>
            <RevenueChart 
              data={revenueData} 
              title="Doanh thu (Đơn thuốc + Phí khám)" 
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <AgeGroupChart dobs={dobData} />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <TopLocations data={locationData} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <MedicineUsageTable data={medicineData} />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
