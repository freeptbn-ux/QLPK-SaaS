/**
 * Phase 01 Security Tests: RLS Enabled + Anon Revoked
 *
 * REQUIRES: .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * RUN: npx vitest run tests/security-hardening/phase-01.test.ts
 */
import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const anonKey      = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

describe('Phase 01: RLS Enabled + Anon Privileges Revoked', () => {

  // Fallback to anonKey if serviceKey is not provided, so the client creation doesn't throw.
  // We will skip tests requiring true admin rights if serviceKey is empty.
  const adminClient = createClient(supabaseUrl, serviceKey || anonKey);

  // -----------------------------------------------------------------------
  // 1. RLS STATUS
  // -----------------------------------------------------------------------
  describe('RLS must be enabled on all 4 sensitive tables', () => {
    const TABLES = ['patients', 'medicines', 'prescriptions_header', 'prescription_details'];

    for (const tableName of TABLES) {
      it(`${tableName} — rls_enabled = true`, async () => {
        if (!serviceKey) {
          // Alternative: attempt an unauthenticated select and expect it to fail / return empty
          const anonClient = createClient(supabaseUrl, anonKey);
          const { data } = await anonClient
            .from(tableName)
            .select('id')
            .limit(1);
          // With RLS enabled and no anon policies, this should return empty or error
          expect(data?.length ?? 0).toBe(0);
        } else {
          const { data: raw, error: rawErr } = await adminClient.rpc(
            'execute_sql_query',
            { query: `SELECT rowsecurity FROM pg_tables WHERE schemaname='public' AND tablename='${tableName}'` }
          ).maybeSingle();

          if (rawErr) {
            const anonClient = createClient(supabaseUrl, anonKey);
            const { data: anonData } = await anonClient
              .from(tableName)
              .select('id')
              .limit(1);
            expect(anonData?.length ?? 0).toBe(0);
          } else {
            expect(raw?.rowsecurity).toBe(true);
          }
        }
      });
    }
  });

  // -----------------------------------------------------------------------
  // 2. ANON ROLE PRIVILEGE CHECK
  // -----------------------------------------------------------------------
  describe('anon role must have ZERO privileges on sensitive tables', () => {
    const SENSITIVE_TABLES = [
      'patients', 'medicines', 'prescriptions_header', 'prescription_details',
      'clinic_daily_stats', 'medicine_dosage_cache', 'legacy_prescription_images',
    ];

    it('anon role has no grants on any sensitive table', async () => {
      if (!serviceKey) {
        console.warn('Skipping admin privilege check due to missing SUPABASE_SERVICE_ROLE_KEY');
        return;
      }
      const { data, error } = await adminClient.from('information_schema.role_table_grants' as any)
        .select('table_name, privilege_type')
        .eq('grantee', 'anon')
        .eq('table_schema', 'public')
        .in('table_name', SENSITIVE_TABLES);

      expect(error).toBeNull();
      expect(data).toHaveLength(0);
    });
  });

  // -----------------------------------------------------------------------
  // 3. UNAUTHENTICATED ACCESS MUST BE BLOCKED
  // -----------------------------------------------------------------------
  describe('Unauthenticated access to patient data must be blocked', () => {
    const anonClient = createClient(supabaseUrl, anonKey);

    it('anon cannot SELECT from patients table', async () => {
      const { data } = await anonClient.from('patients').select('id').limit(5);
      expect(data ?? []).toHaveLength(0);
    });

    it('anon cannot SELECT from medicines table', async () => {
      const { data } = await anonClient.from('medicines').select('id').limit(5);
      expect(data ?? []).toHaveLength(0);
    });

    it('anon cannot SELECT from prescriptions_header table', async () => {
      const { data } = await anonClient.from('prescriptions_header').select('id').limit(5);
      expect(data ?? []).toHaveLength(0);
    });

    it('anon cannot INSERT into patients table', async () => {
      const { error } = await anonClient.from('patients').insert({
        name: 'HACKER TEST',
        dob: '2000-01-01',
        gender: 'Nam',
        phone: '0000000000',
        clinic_id: 1,
      } as any);
      expect(error).not.toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // 4. RLS POLICIES STILL EXIST (NOT ACCIDENTALLY DROPPED)
  // -----------------------------------------------------------------------
  it('RLS policies are still present on patients table', async () => {
    if (!serviceKey) {
      console.warn('Skipping policies existence check due to missing SUPABASE_SERVICE_ROLE_KEY');
      return;
    }
    const { data, error } = await adminClient
      .from('pg_policies' as any)
      .select('policyname')
      .in('tablename', ['patients', 'medicines', 'prescriptions_header', 'prescription_details']);

    expect(error).toBeNull();
    expect((data ?? []).length).toBeGreaterThan(0);
  });
});
