import { getDistinctMonthsYears } from '@/actions/statistics';
import StatisticsClient from '@/components/features/statistics/StatisticsClient';

export const metadata = {
  title: 'Thống kê - QLPK SaaS',
};

export default async function StatisticsPage() {
  const availableMonths = await getDistinctMonthsYears();
  
  return <StatisticsClient availableMonths={availableMonths} />;
}
