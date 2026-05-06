import { Metadata } from 'next';
import { getAllSettings } from '@/actions/settings';
import { 
  getDistinctMonthsYears, 
  getOverviewStats, 
  getStatsByGender, 
  getStatsByLocation,
  getStatsByDayForMonth,
  getRevenueStats,
  getPatientDobsByTime,
  getMedicineUsageStats
} from '@/actions/statistics';
import StatisticsClient from '@/components/features/statistics/StatisticsClient';
import dayjs from 'dayjs';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAllSettings().catch(() => ({} as Record<string, string>));
  const clinicName = settings.clinic_name || 'Phòng khám';
  return {
    title: `Thống kê - ${clinicName}`,
  };
}

export default async function StatisticsPage() {
  const [availableMonths, overview, genderData, locationData] = await Promise.all([
    getDistinctMonthsYears(),
    getOverviewStats(),
    getStatsByGender(),
    getStatsByLocation(),
  ]);

  const defaultMonth = availableMonths[0] || dayjs().format('YYYY-MM');

  // Fetch initial chart data for the default month (day granularity)
  const [initialVisits, initialRevenue, initialDobs, initialMedicines] = await Promise.all([
    getStatsByDayForMonth(defaultMonth),
    getRevenueStats('day', defaultMonth),
    getPatientDobsByTime('month', defaultMonth),
    getMedicineUsageStats(defaultMonth),
  ]);
  
  return (
    <StatisticsClient 
      availableMonths={availableMonths} 
      initialOverview={overview}
      initialGenderData={genderData}
      initialLocationData={locationData}
      initialChartData={{
        visitData: initialVisits,
        revenueData: initialRevenue,
        dobData: initialDobs.filter((d: string | null): d is string => d !== null),
        medicineData: initialMedicines,
      }}
    />
  );
}
