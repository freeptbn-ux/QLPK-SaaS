import { 
  getDistinctMonthsYears, 
  getOverviewStats, 
  getStatsByGender, 
  getStatsByLocation 
} from '@/actions/statistics';
import StatisticsClient from '@/components/features/statistics/StatisticsClient';

export const metadata = {
  title: 'Thống kê - QLPK SaaS',
};

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
