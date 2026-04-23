'use server';

import { createClient } from '@/lib/supabase/server';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(weekOfYear);
dayjs.extend(customParseFormat);

export async function getDistinctMonthsYears() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('prescriptions_header')
    .select('prescription_date');

  if (error) {
    console.error('Error fetching distinct months/years:', error);
    return [];
  }

  const monthsYears = new Set<string>();
  data.forEach((item) => {
    monthsYears.add(dayjs(item.prescription_date).format('YYYY-MM'));
  });

  return Array.from(monthsYears).sort().reverse();
}

export async function getStatsByDayForMonth(yearMonth: string) {
  const supabase = await createClient();
  const start = dayjs(yearMonth).startOf('month').toISOString();
  const end = dayjs(yearMonth).endOf('month').toISOString();

  const { data, error } = await supabase
    .from('prescriptions_header')
    .select('prescription_date')
    .gte('prescription_date', start)
    .lte('prescription_date', end);

  if (error) {
    console.error('Error fetching stats by day:', error);
    return [];
  }

  const stats: Record<string, number> = {};
  data.forEach((item) => {
    const day = dayjs(item.prescription_date).format('DD/MM');
    stats[day] = (stats[day] || 0) + 1;
  });

  return Object.entries(stats).map(([name, count]) => ({ name, count }));
}

export async function getStatsByWeek(limit: number = 8) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('prescriptions_header')
    .select('prescription_date');

  if (error) return [];

  const stats: Record<string, number> = {};
  data.forEach((item) => {
    const d = dayjs(item.prescription_date);
    const week = `W${d.week()}/${d.year()}`;
    stats[week] = (stats[week] || 0) + 1;
  });

  return Object.entries(stats)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, limit)
    .reverse()
    .map(([name, count]) => ({ name, count }));
}

export async function getStatsByMonth(limit: number = 12) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('prescriptions_header')
    .select('prescription_date');

  if (error) return [];

  const stats: Record<string, number> = {};
  data.forEach((item) => {
    const month = dayjs(item.prescription_date).format('MM/YYYY');
    stats[month] = (stats[month] || 0) + 1;
  });

  return Object.entries(stats)
    .sort((a, b) => {
      const dateA = dayjs(a[0], 'MM/YYYY');
      const dateB = dayjs(b[0], 'MM/YYYY');
      return dateA.isAfter(dateB) ? 1 : -1;
    })
    .slice(-limit)
    .map(([name, count]) => ({ name, count }));
}

export async function getStatsByYear() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('prescriptions_header')
    .select('prescription_date');

  if (error) return [];

  const stats: Record<string, number> = {};
  data.forEach((item) => {
    const year = dayjs(item.prescription_date).format('YYYY');
    stats[year] = (stats[year] || 0) + 1;
  });

  return Object.entries(stats).map(([name, count]) => ({ name, count }));
}

export async function getStatsByGender() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('patients')
    .select('gender');

  if (error) return [];

  const stats: Record<string, number> = {};
  data.forEach((item) => {
    const gender = item.gender || 'Không xác định';
    stats[gender] = (stats[gender] || 0) + 1;
  });

  return Object.entries(stats).map(([name, value]) => ({ name, value }));
}

export async function getStatsByLocation(limit: number = 20) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('patients')
    .select('address');

  if (error) return [];

  const stats: Record<string, number> = {};
  data.forEach((item) => {
    const address = item.address || 'Không xác định';
    stats[address] = (stats[address] || 0) + 1;
  });

  return Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

export async function getPatientDobsByTime(filterType: string, timeValue: string) {
  const supabase = await createClient();
  let query = supabase.from('prescriptions_header').select('patient_id, patients(dob)');

  if (filterType === 'month') {
    const start = dayjs(timeValue).startOf('month').toISOString();
    const end = dayjs(timeValue).endOf('month').toISOString();
    query = query.gte('prescription_date', start).lte('prescription_date', end);
  } else if (filterType === 'year') {
    const start = dayjs(timeValue).startOf('year').toISOString();
    const end = dayjs(timeValue).endOf('year').toISOString();
    query = query.gte('prescription_date', start).lte('prescription_date', end);
  }

  const { data, error } = await query;
  if (error) return [];

  return data.map((item: any) => item.patients?.dob).filter(Boolean);
}

export async function getMedicineUsageStats(yearMonth?: string) {
  const supabase = await createClient();
  let query = supabase.from('prescription_details').select('quantity, unit_price, medicines(name)');

  if (yearMonth) {
    const start = dayjs(yearMonth).startOf('month').toISOString();
    const end = dayjs(yearMonth).endOf('month').toISOString();
    
    const { data: headers, error: hError } = await supabase
      .from('prescriptions_header')
      .select('id')
      .gte('prescription_date', start)
      .lte('prescription_date', end);
    
    if (hError || !headers) return [];
    const headerIds = headers.map(h => h.id);
    if (headerIds.length === 0) return [];
    
    query = query.in('prescription_header_id', headerIds);
  }

  const { data, error } = await query;
  if (error) return [];

  const stats: Record<string, { totalQuantity: number; totalRevenue: number }> = {};
  data.forEach((item: any) => {
    const name = item.medicines?.name || 'Unknown';
    if (!stats[name]) {
      stats[name] = { totalQuantity: 0, totalRevenue: 0 };
    }
    stats[name].totalQuantity += item.quantity;
    stats[name].totalRevenue += item.quantity * (item.unit_price || 0);
  });

  return Object.entries(stats)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.totalQuantity - a.totalQuantity);
}

export async function getRevenueStats(yearMonth?: string) {
  const supabase = await createClient();
  let query = supabase.from('prescriptions_header').select('total_amount, consultation_fee, prescription_date');

  if (yearMonth) {
    const start = dayjs(yearMonth).startOf('month').toISOString();
    const end = dayjs(yearMonth).endOf('month').toISOString();
    query = query.gte('prescription_date', start)
      .lte('prescription_date', end);
  }

  const { data, error } = await query;
  if (error) return [];

  const statsByMonth: Record<string, number> = {};
  data.forEach((item) => {
    const month = dayjs(item.prescription_date).format('MM/YYYY');
    const revenue = (item.total_amount || 0) + (item.consultation_fee || 0);
    statsByMonth[month] = (statsByMonth[month] || 0) + revenue;
  });

  return Object.entries(statsByMonth)
    .sort((a, b) => {
      const dateA = dayjs(a[0], 'MM/YYYY');
      const dateB = dayjs(b[0], 'MM/YYYY');
      return dateA.isAfter(dateB) ? 1 : -1;
    })
    .map(([name, revenue]) => ({ name, revenue }));
}

export async function getOverviewStats() {
  const supabase = await createClient();
  
  const [patientsCount, monthlyVisits, monthlyRevenue, lowStock] = await Promise.all([
    supabase.from('patients').select('*', { count: 'exact', head: true }),
    supabase.from('prescriptions_header')
      .select('*', { count: 'exact', head: true })
      .gte('prescription_date', dayjs().startOf('month').toISOString()),
    supabase.from('prescriptions_header')
      .select('total_amount, consultation_fee')
      .gte('prescription_date', dayjs().startOf('month').toISOString()),
    supabase.from('medicines')
      .select('*', { count: 'exact', head: true })
      .filter('stock_quantity', 'lte', 'min_stock_level')
  ]);

  const revenue = monthlyRevenue.data?.reduce((acc, curr) => acc + (curr.total_amount || 0) + (curr.consultation_fee || 0), 0) || 0;

  return {
    totalPatients: patientsCount.count || 0,
    monthlyVisits: monthlyVisits.count || 0,
    monthlyRevenue: revenue,
    lowStockCount: lowStock.count || 0
  };
}
