import { Metadata } from 'next';
import { getAllSettings } from '@/actions/settings';
import { 
  getDistinctMonthsYears, 
  getOverviewStats, 
  getStatsByGender, 
  getStatsByLocation 
} from '@/actions/statistics';
import StatisticsClient from '@/components/features/statistics/StatisticsClient';

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
  
  return (
    <StatisticsClient 
      availableMonths={availableMonths} 
      initialOverview={overview}
      initialGenderData={genderData}
      initialLocationData={locationData}
    />
  );
}
