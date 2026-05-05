import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

describe('RLS PL/pgSQL Migration Verification', () => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  it('should have get_my_role() defined as plpgsql', async () => {
    const { data, error } = await supabase.rpc('execute_sql_query', {
      query: "SELECT l.lanname FROM pg_proc p JOIN pg_language l ON p.prolang = l.oid WHERE p.proname = 'get_my_role';"
    });

    // Note: If execute_sql_query RPC doesn't exist, this test might fail or need adjustment.
    // However, we can use the MCP execute_sql for verification during development.
    expect(error).toBeNull();
    expect(data[0].lanname).toBe('plpgsql');
  });

  it('should have get_my_clinic_id() defined as plpgsql', async () => {
    const { data, error } = await supabase.rpc('execute_sql_query', {
      query: "SELECT l.lanname FROM pg_proc p JOIN pg_language l ON p.prolang = l.oid WHERE p.proname = 'get_my_clinic_id';"
    });

    expect(error).toBeNull();
    expect(data[0].lanname).toBe('plpgsql');
  });
});
