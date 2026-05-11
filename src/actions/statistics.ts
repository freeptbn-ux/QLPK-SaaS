'use server';

import { getAuthUser } from '@/lib/supabase/auth';
import dayjs from 'dayjs';

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
  
  const startDate = dayjs(yearMonth).startOf('month').format('YYYY-MM-DD');
  const endDate = dayjs(yearMonth).endOf('month').format('YYYY-MM-DD');

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

  if (timeRange === 'day' && selectedMonth) {
    const startDate = dayjs(selectedMonth).startOf('month').format('YYYY-MM-DD');
    const endDate = dayjs(selectedMonth).endOf('month').format('YYYY-MM-DD');
    query = query.gte('date', startDate).lte('date', endDate);
  } else if (timeRange === 'week') {
    const eightWeeksAgo = dayjs().subtract(8, 'week').format('YYYY-MM-DD');
    query = query.gte('date', eightWeeksAgo);
  } else if (timeRange === 'month') {
    const twelveMonthsAgo = dayjs().subtract(12, 'month').startOf('month').format('YYYY-MM-DD');
    query = query.gte('date', twelveMonthsAgo);
  }

  const { data, error } = await query.order('date', { ascending: true });

  if (error) {
    console.error('Error fetching revenue stats:', error);
    throw new Error(error.message);
  }

  // Aggregate by week/month/year if needed, but for 'day' it's simple
  if (timeRange === 'day') {
    return (data || []).map(item => ({
      name: dayjs(item.date).format('DD/MM'),
      revenue: Number(item.total_revenue || 0)
    }));
  }

  // For week/month/year, we might need more complex aggregation or just return raw if the chart handles it
  // Given the previous RPC 'get_revenue_stats_v2' did the aggregation, we should probably do it here too
  // But let's start with 'day' as it's the primary one used on the initial load.
  
  return (data || []).map(item => ({
    name: dayjs(item.date).format('DD/MM'),
    revenue: Number(item.total_revenue || 0)
  }));
}

export async function getOverviewStats() {
  const { supabase } = await getAuthUser();
  
  const now = new Date();
  // Use YYYY-MM-DD format to avoid timezone offset issues when comparing in Postgres
  const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  
  const [patientsCount, dailyStatsResult, lowStock] = await Promise.all([
    supabase.from('patients').select('*', { count: 'exact', head: true }),
    supabase.from('clinic_daily_stats')
      .select('visit_count, total_revenue')
      .gte('date', startOfMonth),
    supabase.rpc('get_low_stock_count')
  ]);

  // Check for errors
  if (patientsCount.error) throw new Error(patientsCount.error.message);
  if (dailyStatsResult.error) throw new Error(dailyStatsResult.error.message);
  if (lowStock.error) throw new Error(lowStock.error.message);

  const dailyStats = dailyStatsResult.data || [];
  const monthlyVisits = dailyStats.reduce((acc, curr) => acc + (curr.visit_count || 0), 0);
  const monthlyRevenue = dailyStats.reduce((acc, curr) => acc + Number(curr.total_revenue || 0), 0);

  return {
    totalPatients: patientsCount.count || 0,
    monthlyVisits,
    monthlyRevenue,
    lowStockCount: Number(lowStock.data) || 0
  };
}
