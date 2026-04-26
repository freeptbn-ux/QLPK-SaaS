'use server';

import { createClient } from '@/lib/supabase/server';

export async function getDistinctMonthsYears() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_distinct_months_years');

  if (error) {
    console.error('Error fetching distinct months/years:', error);
    throw new Error(error.message);
  }

  return (data || []).map((item: { month: string }) => item.month);
}

export async function getStatsByDayForMonth(yearMonth: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_stats_by_day_for_month', {
    p_year_month: yearMonth,
  });

  if (error) {
    console.error('Error fetching stats by day:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function getStatsByWeek(limit: number = 8) {
  const supabase = await createClient();
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
  const supabase = await createClient();
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
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_stats_by_year');

  if (error) {
    console.error('Error fetching stats by year:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function getStatsByGender() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_stats_by_gender');

  if (error) {
    console.error('Error fetching stats by gender:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function getStatsByLocation(limit: number = 20) {
  const supabase = await createClient();
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
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_patient_dobs_by_time', {
    p_filter_type: filterType,
    p_time_value: timeValue,
  });

  if (error) {
    console.error('Error fetching patient DOBs:', error);
    throw new Error(error.message);
  }

  return (data || []).map((item: { dob: string | null }) => item.dob);
}

export async function getMedicineUsageStats(yearMonth?: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_medicine_usage_stats', {
    p_year_month: yearMonth || null,
  });

  if (error) {
    console.error('Error fetching medicine usage stats:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function getRevenueStats(yearMonth?: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_revenue_stats', {
    p_year_month: yearMonth || null,
  });

  if (error) {
    console.error('Error fetching revenue stats:', error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function getOverviewStats() {
  const supabase = await createClient();
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  
  const results = await Promise.all([
    supabase.from('patients').select('*', { count: 'estimated', head: true }),
    supabase.from('prescriptions_header')
      .select('*', { count: 'exact', head: true })
      .gte('prescription_date', startOfMonth),
    supabase.rpc('get_monthly_revenue_total'),
    supabase.rpc('get_low_stock_count')
  ]);

  const [patientsCount, monthlyVisits, revenueData, lowStock] = results;

  // Check for errors in any of the calls
  for (const res of results) {
    if (res.error) {
      console.error('Error in getOverviewStats batch:', res.error);
      throw new Error(res.error.message);
    }
  }

  return {
    totalPatients: patientsCount.count || 0,
    monthlyVisits: monthlyVisits.count || 0,
    monthlyRevenue: Number(revenueData.data) || 0,
    lowStockCount: Number(lowStock.data) || 0
  };
}
