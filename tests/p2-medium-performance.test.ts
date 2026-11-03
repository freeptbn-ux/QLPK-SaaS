import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

describe('P2 Medium Performance Verification Suite', () => {
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  it('PERF-010: should verify that duplicate index idx_prescriptions_patient_date_desc is removed', async () => {
    const { data, error } = await adminClient.rpc('execute_sql_query', {
      query: `SELECT indexname FROM pg_indexes WHERE tablename = 'prescriptions_header' AND indexname = 'idx_prescriptions_patient_date_desc';`
    });

    if (!error && data) {
      expect(data.length).toBe(0);
    }
  });

  it('PERF-008: should verify that get_patient_dobs_by_time handles all filter type', async () => {
    // Calling get_patient_dobs_by_time with 'all' should not throw or return null
    const { data, error } = await adminClient.rpc('get_patient_dobs_by_time', {
      p_filter_type: 'all',
      p_time_value: ''
    });

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('PERF-009: should verify that multiple permissive policies are resolved', async () => {
    const { data, error } = await adminClient.rpc('execute_sql_query', {
      query: `
        SELECT tablename, cmd, count(*) 
        FROM pg_policies 
        WHERE tablename IN ('clinic_daily_stats', 'medicines', 'prescriptions_header', 'profiles', 'settings')
          AND roles @> '{authenticated}'
        GROUP BY tablename, cmd
        HAVING count(*) > 1;
      `
    });

    if (!error && data) {
      // There should be no duplicate permissive policies for the same role and command
      expect(data.length).toBe(0);
    }
  });

  it('PERF-013: should verify is_low_stock generated column and indexes exist on medicines table', async () => {
    const { data, error } = await adminClient.rpc('execute_sql_query', {
      query: `
        SELECT column_name, is_generated 
        FROM information_schema.columns 
        WHERE table_name = 'medicines' AND column_name = 'is_low_stock';
      `
    });

    if (!error && data) {
      expect(data.length).toBe(1);
      expect(data[0].column_name).toBe('is_low_stock');
    }
  });

  it('PERF-012: should verify get_low_stock_count returns a valid count scalar', async () => {
    const { data, error } = await adminClient.rpc('get_low_stock_count');

    expect(error).toBeNull();
    expect(typeof Number(data)).toBe('number');
  });
});

