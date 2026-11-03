'use server';

import { getAuthUser } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);

const VN_TIMEZONE = 'Asia/Ho_Chi_Minh';

export async function getDistinctMonthsYears() {
  const { supabase } = await getAuthUser();
  const { data, error } = await supabase.rpc('get_distinct_months_years');

  if (error) {
    console.error('Error fetching distinct months/years:', error);
    throw new Error(error.message);
  }

  // Assumption: the RPC 'get_distinct_months_years' returns objects with a 'month' property 
  // in 'YYYY-MM' format. If the DB schema changes, this mapping must be updated.
  return (data || []).map((item: { month: string }) => item.month);
}

export async function getStatsByDayForMonth(yearMonth: string) {
  const { supabase, clinicId } = await getAuthUser();
  
  const startDate = dayjs(yearMonth).tz(VN_TIMEZONE).startOf('month').format('YYYY-MM-DD');
  const endDate = dayjs(yearMonth).tz(VN_TIMEZONE).endOf('month').format('YYYY-MM-DD');

  const { data, error } = await supabase
    .from('clinic_daily_stats')
    .select('date, visit_count')
    .eq('clinic_id', clinicId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching stats by day:', error);
    throw new Error(error.message);
  }

  return (data || []).map(item => ({
    name: dayjs(item.date).format('DD/MM'),
    count: item.visit_count || 0
  }));
}

export async function getStatsByWeek(limit: number = 8) {
  const { supabase } = await getAuthUser();
  const { data, error } = await supabase.rpc('get_stats_by_week', {
    p_limit: limit,
  });

  if (error) {
    console.error('Error fetching stats by week:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function getStatsByMonth(limit: number = 12) {
  const { supabase } = await getAuthUser();
  const { data, error } = await supabase.rpc('get_stats_by_month', {
    p_limit: limit,
  });

  if (error) {
    console.error('Error fetching stats by month:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function getStatsByYear() {
  const { supabase } = await getAuthUser();
  const { data, error } = await supabase.rpc('get_stats_by_year');

  if (error) {
    console.error('Error fetching stats by year:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function getStatsByGender() {
  const { supabase } = await getAuthUser();
  const { data, error } = await supabase.rpc('get_stats_by_gender');

  if (error) {
    console.error('Error fetching stats by gender:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function getStatsByLocation(limit: number = 20) {
  const { supabase } = await getAuthUser();
  const { data, error } = await supabase.rpc('get_stats_by_location', {
    p_limit: limit,
  });

  if (error) {
    console.error('Error fetching stats by location:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function getPatientDobsByTime(filterType: string, timeValue: string) {
  const { supabase } = await getAuthUser();
  const { data, error } = await supabase.rpc('get_patient_dobs_by_time', {
    p_filter_type: filterType,
    p_time_value: timeValue,
  });

  if (error) {
    console.error('Error fetching patient DOBs:', error);
    throw new Error(error.message);
  }

  return (data || [])
    .map((item: { dob: string | null }) => item.dob)
    .filter((dob: string | null): dob is string => dob !== null);
}

export async function getMedicineUsageStats(yearMonth?: string) {
  const { supabase } = await getAuthUser();
  const { data, error } = await supabase.rpc('get_medicine_usage_stats', {
    p_year_month: yearMonth || null,
  });

  if (error) {
    console.error('Error fetching medicine usage stats:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function getRevenueStats(timeRange: string = 'month', selectedMonth?: string) {
  const { supabase, clinicId } = await getAuthUser();
  
  let query = supabase
    .from('clinic_daily_stats')
    .select('date, total_revenue')
    .eq('clinic_id', clinicId);

  const now = dayjs().tz(VN_TIMEZONE);

  if (timeRange === 'day' && selectedMonth) {
    const startDate = dayjs(selectedMonth).tz(VN_TIMEZONE).startOf('month').format('YYYY-MM-DD');
    const endDate = dayjs(selectedMonth).tz(VN_TIMEZONE).endOf('month').format('YYYY-MM-DD');
    query = query.gte('date', startDate).lte('date', endDate);
  } else if (timeRange === 'week') {
    const eightWeeksAgo = now.subtract(8, 'week').startOf('week').format('YYYY-MM-DD');
    query = query.gte('date', eightWeeksAgo);
  } else if (timeRange === 'month') {
    const twelveMonthsAgo = now.subtract(12, 'month').startOf('month').format('YYYY-MM-DD');
    query = query.gte('date', twelveMonthsAgo);
  }

  const { data, error } = await query.order('date', { ascending: true });

  if (error) {
    console.error('Error fetching revenue stats:', error);
    throw new Error(error.message);
  }

  const rawData = data || [];

  if (timeRange === 'day') {
    return rawData.map(item => ({
      name: dayjs(item.date).format('DD/MM'),
      revenue: Number(item.total_revenue || 0)
    }));
  }

  if (timeRange === 'week') {
    // Group by ISO Week
    const weeklyData: Record<string, number> = {};
    rawData.forEach(item => {
      const d = dayjs(item.date).tz(VN_TIMEZONE);
      const weekKey = `${d.isoWeekYear()}-W${String(d.isoWeek()).padStart(2, '0')}`;
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + Number(item.total_revenue || 0);
    });
    return Object.entries(weeklyData).map(([name, revenue]) => ({ name, revenue }));
  }

  if (timeRange === 'month') {
    // Group by Month
    const monthlyData: Record<string, number> = {};
    rawData.forEach(item => {
      const monthKey = dayjs(item.date).format('MM/YYYY');
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + Number(item.total_revenue || 0);
    });
    return Object.entries(monthlyData).map(([name, revenue]) => ({ name, revenue }));
  }

  return rawData.map(item => ({
    name: dayjs(item.date).format('DD/MM'),
    revenue: Number(item.total_revenue || 0)
  }));
}

export async function getOverviewStats() {
  const { supabase, clinicId } = await getAuthUser();
  
  const now = dayjs().tz(VN_TIMEZONE);
  const startOfMonth = now.startOf('month').format('YYYY-MM-DD');
  
  const [patientsCount, monthlyStatsResult, lowStock, outOfStock] = await Promise.all([
    supabase.from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId),
    supabase.from('clinic_daily_stats')
      .select('visit_count, total_revenue')
      .eq('clinic_id', clinicId)
      .gte('date', startOfMonth),
    supabase.rpc('get_low_stock_count'),
    supabase.rpc('get_out_of_stock_count')
  ]);

  if (patientsCount.error) {
    console.error('Error fetching patients count:', patientsCount.error);
    throw new Error(patientsCount.error.message);
  }
  if (monthlyStatsResult.error) {
    console.error('Error fetching monthly stats:', monthlyStatsResult.error);
    throw new Error(monthlyStatsResult.error.message);
  }
  if (lowStock.error) {
    console.error('Error fetching low stock count:', lowStock.error);
    throw new Error(lowStock.error.message);
  }
  if (outOfStock.error) {
    console.error('Error fetching out of stock count:', outOfStock.error);
    throw new Error(outOfStock.error.message);
  }

  const dailyStats = monthlyStatsResult.data || [];
  const monthlyVisits = dailyStats.reduce((acc, curr) => acc + (curr.visit_count || 0), 0);
  const monthlyRevenue = dailyStats.reduce((acc, curr) => acc + Number(curr.total_revenue || 0), 0);

  return {
    totalPatients: patientsCount.count || 0,
    monthlyVisits,
    monthlyRevenue,
    lowStockCount: Number(lowStock.data) || 0,
    outOfStockCount: Number(outOfStock.data) || 0
  };
}

export interface DashboardStatsParams {
  startDate?: string;
  endDate?: string;
  timeRange?: 'day' | 'week' | 'month' | 'year';
  selectedMonth?: string;
}

export interface DashboardStatsPayload {
  kpis: {
    total_revenue: number;
    prescription_count: number;
    patient_visit_count: number;
    avg_prescription_value: number;
  };
  revenue_trends: Array<{
    date: string;
    revenue: number;
    visits: number;
    name?: string;
    count?: number;
  }>;
  top_medicines: Array<{
    name: string;
    total_quantity: number;
    total_revenue: number;
    totalQuantity?: number;
    totalRevenue?: number;
  }>;
  demographics: {
    gender: { male: number; female: number; other: number } | Array<{ name: string; value: number }>;
    age_groups: { under_18: number; adult: number; elderly: number };
    dob_list?: string[];
  };
  overview?: {
    totalPatients: number;
    monthlyVisits: number;
    monthlyRevenue: number;
    lowStockCount: number;
    outOfStockCount?: number;
  };
  available_months?: string[];
  locations?: Array<{ name: string; count: number }>;
}

export interface DashboardStatsResponse {
  data: DashboardStatsPayload;
  error?: string | null;
}

/**
 * Unified statistics retrieval action.
 * Consolidates dashboard queries into a single database RPC roundtrip (PERF-006).
 */
export async function getDashboardStatistics(
  params?: DashboardStatsParams
): Promise<DashboardStatsResponse> {
  const auth = await getAuthUser();
  const supabase = (auth as any)?.supabase || (await createClient());
  const clinicId = auth.clinic_id ?? auth.clinicId;

  let startDate = params?.startDate;
  let endDate = params?.endDate;

  if (!startDate && !endDate && params?.selectedMonth) {
    startDate = dayjs(params.selectedMonth).tz(VN_TIMEZONE).startOf('month').format('YYYY-MM-DD');
    endDate = dayjs(params.selectedMonth).tz(VN_TIMEZONE).endOf('month').format('YYYY-MM-DD');
  }

  // 1. Primary unified retrieval via consolidated RPC (1 database roundtrip)
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_dashboard_statistics', {
    p_start_date: startDate || null,
    p_end_date: endDate || null,
    p_clinic_id: clinicId,
    p_time_range: params?.timeRange || 'day',
  });

  if (!rpcError && rpcData) {
    return { data: rpcData, error: null };
  }

  // 2. Resilient fallback query path if RPC is unavailable (<= 2 database operations)
  let statsQuery = supabase
    .from('clinic_daily_stats')
    .select('date, visit_count, prescription_count, total_revenue')
    .eq('clinic_id', clinicId);

  if (startDate) {
    statsQuery = statsQuery.gte('date', startDate);
  }
  if (endDate) {
    statsQuery = statsQuery.lte('date', endDate);
  }

  const { data: dailyStats, error: statsError } = await statsQuery.order('date', { ascending: true });

  if (statsError) {
    console.error('Error in getDashboardStatistics fallback:', statsError);
    throw new Error(statsError.message);
  }

  const rows = (dailyStats || []) as Array<Record<string, any>>;
  const totalRevenue = rows.reduce((sum: number, r: Record<string, any>) => sum + Number(r.total_revenue || 0), 0);
  const totalPrescriptions = rows.reduce((sum: number, r: Record<string, any>) => sum + Number(r.prescription_count || r.visit_count || 0), 0);
  const totalVisits = rows.reduce((sum: number, r: Record<string, any>) => sum + Number(r.visit_count || 0), 0);
  const avgPrescriptionValue = totalPrescriptions > 0 ? Math.round(totalRevenue / totalPrescriptions) : 0;

  const fallbackData: DashboardStatsPayload = {
    kpis: {
      total_revenue: totalRevenue,
      prescription_count: totalPrescriptions,
      patient_visit_count: totalVisits,
      avg_prescription_value: avgPrescriptionValue,
    },
    revenue_trends: rows.map((r: Record<string, any>) => ({
      date: r.date,
      name: dayjs(r.date).format('DD/MM'),
      revenue: Number(r.total_revenue || 0),
      visits: Number(r.visit_count || 0),
      count: Number(r.visit_count || 0),
    })),
    top_medicines: [],
    demographics: {
      gender: { male: 0, female: 0, other: 0 },
      age_groups: { under_18: 0, adult: 0, elderly: 0 },
      dob_list: [],
    },
    overview: {
      totalPatients: 0,
      monthlyVisits: totalVisits,
      monthlyRevenue: totalRevenue,
      lowStockCount: 0,
      outOfStockCount: 0,
    },
    available_months: [],
    locations: [],
  };

  return { data: fallbackData, error: null };
}

export const getUnifiedStatistics = getDashboardStatistics;

