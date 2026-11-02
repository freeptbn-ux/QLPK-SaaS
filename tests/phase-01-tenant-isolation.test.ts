import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

describe('Phase 01: Multi-Tenant Isolation & Clinic-Scoped Constraints', () => {
  let adminClient: SupabaseClient;
  const testClinicA = 11111111;
  const testClinicB = 22222222;
  const testDob = '1985-05-15';
  const sharedNormalizedName = 'nguyen van test unique';

  beforeAll(async () => {
    expect(supabaseUrl).toBeTruthy();
    expect(serviceRoleKey).toBeTruthy();
    adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Ensure test clinics exist
    await adminClient.from('clinics').upsert([
      { id: testClinicA, name: 'Test Clinic Alpha' },
      { id: testClinicB, name: 'Test Clinic Beta' },
    ]);

    // Clean up any existing test records for these clinics
    await adminClient.from('patients').delete().in('clinic_id', [testClinicA, testClinicB]);
  });

  afterAll(async () => {
    if (adminClient) {
      await adminClient.from('patients').delete().in('clinic_id', [testClinicA, testClinicB]);
    }
  });

  it('Requirement PERF-002: should allow patients with the same name and DOB in different clinics', async () => {
    // 1. Insert patient in Clinic A
    const { data: patientA, error: errorA } = await adminClient.from('patients').insert({
      clinic_id: testClinicA,
      name: 'Nguyễn Văn Test Unique',
      name_normalized: sharedNormalizedName,
      dob: testDob,
      gender: 'male',
      phone: '0900000001',
    }).select().single();

    expect(errorA).toBeNull();
    expect(patientA).toBeDefined();
    expect(patientA.clinic_id).toBe(testClinicA);

    // 2. Insert patient with identical name and DOB in Clinic B
    // Must succeed without violating unique constraint
    const { data: patientB, error: errorB } = await adminClient.from('patients').insert({
      clinic_id: testClinicB,
      name: 'Nguyễn Văn Test Unique',
      name_normalized: sharedNormalizedName,
      dob: testDob,
      gender: 'male',
      phone: '0900000002',
    }).select().single();

    expect(errorB).toBeNull();
    expect(patientB).toBeDefined();
    expect(patientB.clinic_id).toBe(testClinicB);
  });

  it('Requirement PERF-002: should still enforce uniqueness within the SAME clinic', async () => {
    // Attempting to insert duplicate inside Clinic A should trigger unique constraint
    const { error: duplicateError } = await adminClient.from('patients').insert({
      clinic_id: testClinicA,
      name: 'Nguyễn Văn Test Unique',
      name_normalized: sharedNormalizedName,
      dob: testDob,
      gender: 'male',
      phone: '0900000003',
    });

    expect(duplicateError).not.toBeNull();
    expect(duplicateError?.code).toBe('23505'); // unique_violation
  });

  it('Requirement PERF-001: get_patients_with_last_visit must not leak patients across clinics', async () => {
    // Verify that RPC definition enforces clinic_id filtering
    const { data: rpcDef, error: rpcError } = await adminClient.rpc('execute_sql_query', {
      query: "SELECT prosrc FROM pg_proc WHERE proname = 'get_patients_with_last_visit';"
    });

    if (!rpcError && rpcDef?.[0]?.prosrc) {
      const sourceCode: string = rpcDef[0].prosrc;
      // Must contain clinic isolation filter
      expect(sourceCode).toMatch(/clinic_id\s*=\s*(get_my_clinic_id\(\)|\$|p_clinic_id)/i);
    } else {
      // Fallback verification: inspect SQL migration definition directly
      const fs = await import('fs');
      const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');
      const migrationFiles = fs.readdirSync(migrationsDir);
      const latestPatientRpc = migrationFiles
        .filter(f => f.includes('patient_last_visit') || f.includes('tenant_isolation'))
        .sort()
        .pop();

      expect(latestPatientRpc).toBeDefined();
      const content = fs.readFileSync(path.join(migrationsDir, latestPatientRpc!), 'utf-8');
      expect(content).toMatch(/clinic_id\s*=\s*(get_my_clinic_id\(\)|p_clinic_id)/i);
    }
  });
});

