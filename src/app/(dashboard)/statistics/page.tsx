import { Metadata } from 'next';
import { getAllSettings } from '@/actions/settings';
import { getDashboardStatistics } from '@/actions/statistics';
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
  const defaultMonth = dayjs().format('YYYY-MM');
  const result = await getDashboardStatistics({ selectedMonth: defaultMonth });
  const dashboard = result?.data;

  const availableMonths = dashboard?.available_months?.length 
    ? dashboard.available_months 
    : [defaultMonth];

  const overview = dashboard?.overview || {
    totalPatients: 0,
    monthlyVisits: dashboard?.kpis?.patient_visit_count || 0,
    monthlyRevenue: dashboard?.kpis?.total_revenue || 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  };

  const genderData = Array.isArray(dashboard?.demographics?.gender)
    ? dashboard.demographics.gender
    : [
        { name: 'Nam', value: (dashboard?.demographics?.gender as any)?.male || 0 },
        { name: 'Nữ', value: (dashboard?.demographics?.gender as any)?.female || 0 },
        { name: 'Khác', value: (dashboard?.demographics?.gender as any)?.other || 0 },
      ];

  const locationData = dashboard?.locations || [];

  const initialVisits = (dashboard?.revenue_trends || []).map(item => ({
    name: item.name || dayjs(item.date).format('DD/MM'),
    count: item.visits || 0,
  }));

  const initialRevenue = (dashboard?.revenue_trends || []).map(item => ({
    name: item.name || dayjs(item.date).format('DD/MM'),
    revenue: item.revenue || 0,
  }));

  const initialDobs = dashboard?.demographics?.dob_list || [];

  const initialMedicines = (dashboard?.top_medicines || []).map(item => ({
    name: item.name,
    totalQuantity: item.total_quantity ?? (item as any).totalQuantity ?? 0,
    totalRevenue: item.total_revenue ?? (item as any).totalRevenue ?? 0,
  }));

  return (
    <StatisticsClient 
      availableMonths={availableMonths} 
      initialOverview={overview}
      initialGenderData={genderData}
      initialLocationData={locationData}
      initialChartData={{
        visitData: initialVisits,
        revenueData: initialRevenue,
        dobData: initialDobs,
        medicineData: initialMedicines,
      }}
    />
  );
}
