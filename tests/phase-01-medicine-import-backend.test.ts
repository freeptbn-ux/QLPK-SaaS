import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Mock auth helper so server actions run under active test tenant context
const mockSession = {
  currentClinicId: 88880001,
};

let cachedClient: SupabaseClient | null = null;
function getSharedClient() {
  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cachedClient;
}

vi.mock('@/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(async () => {
    return {
      user: { id: '00000000-0000-0000-0000-000000000001', email: 'test@clinic-a.com' },
      supabase: getSharedClient(),
      clinicId: mockSession.currentClinicId,
      clinic_id: mockSession.currentClinicId,
      role: 'admin',
    };
  }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

describe('Phase 01: Database Alias Storage & Atomic Batch Ingestion', () => {
  let adminClient: SupabaseClient;
  const clinicA = 88880001;
  const clinicB = 88880002;

  let medA1: number;
  let medA2: number;
  let medA3: number;
  let medB1: number;

  beforeAll(async () => {
    expect(supabaseUrl).toBeTruthy();
    expect(serviceRoleKey).toBeTruthy();
    adminClient = createClient(supabaseUrl, serviceRoleKey);

    // 1. Ensure test clinics exist
    await adminClient.from('clinics').upsert([
      { id: clinicA, name: 'Import Test Clinic Alpha' },
      { id: clinicB, name: 'Import Test Clinic Beta' },
    ]);

    // 2. Clean up previous test artifacts if any
    await adminClient.from('medicine_aliases').delete().in('clinic_id', [clinicA, clinicB]);
    await adminClient.from('inventory_transaction_logs').delete().in('clinic_id', [clinicA, clinicB]);
    await adminClient.from('medicines').delete().in('clinic_id', [clinicA, clinicB]);

    // 3. Create test medicines for Clinic A
    const { data: insertedA, error: errA } = await adminClient.from('medicines').insert([
      { clinic_id: clinicA, name: 'Paracetamol 500mg Batch Test', price: 1000, stock_quantity: 0, is_active: true },
      { clinic_id: clinicA, name: 'Amoxicillin 500mg Batch Test', price: 2000, stock_quantity: 15, is_active: true },
      { clinic_id: clinicA, name: 'Ibuprofen 400mg Batch Test', price: 1500, stock_quantity: 50, is_active: true },
    ]).select();

    expect(errA).toBeNull();
    expect(insertedA).toHaveLength(3);
    medA1 = insertedA![0].id;
    medA2 = insertedA![1].id;
    medA3 = insertedA![2].id;

    // 4. Create test medicine for foreign Clinic B
    const { data: insertedB, error: errB } = await adminClient.from('medicines').insert([
      { clinic_id: clinicB, name: 'Foreign Clinic Medicine Beta', price: 5000, stock_quantity: 10, is_active: true },
    ]).select();

    expect(errB).toBeNull();
    medB1 = insertedB![0].id;
  });

  afterAll(async () => {
    if (adminClient) {
      await adminClient.from('medicine_aliases').delete().in('clinic_id', [clinicA, clinicB]);
      await adminClient.from('inventory_transaction_logs').delete().in('clinic_id', [clinicA, clinicB]);
      await adminClient.from('medicines').delete().in('clinic_id', [clinicA, clinicB]);
    }
  });

  beforeEach(() => {
    mockSession.currentClinicId = clinicA;
  });

  it('1. Tenant Isolation Test: should only return aliases matching the authenticated clinic ID', async () => {
    const { getMedicineAliases, saveMedicineAliases } = await import('@/actions/medicines');

    // Seed alias in Clinic A
    mockSession.currentClinicId = clinicA;
    await saveMedicineAliases([
      { raw_name: 'Thuốc Hạ Sốt A', medicine_id: medA1 },
    ]);

    // Seed alias in Clinic B
    mockSession.currentClinicId = clinicB;
    await saveMedicineAliases([
      { raw_name: 'Thuốc Hạ Sốt Foreign B', medicine_id: medB1 },
    ]);

    // Query as Clinic A
    mockSession.currentClinicId = clinicA;
    const aliasesClinicA = await getMedicineAliases();

    expect(aliasesClinicA.length).toBeGreaterThanOrEqual(1);
    expect(aliasesClinicA.some((a) => a.raw_name === 'Thuốc Hạ Sốt A' && a.medicine_id === medA1)).toBe(true);
    expect(aliasesClinicA.some((a) => a.raw_name === 'Thuốc Hạ Sốt Foreign B')).toBe(false);

    // Query as Clinic B
    mockSession.currentClinicId = clinicB;
    const aliasesClinicB = await getMedicineAliases();
    expect(aliasesClinicB.some((a) => a.raw_name === 'Thuốc Hạ Sốt Foreign B' && a.medicine_id === medB1)).toBe(true);
    expect(aliasesClinicB.some((a) => a.raw_name === 'Thuốc Hạ Sốt A')).toBe(false);
  });

  it('2. Alias Upsert Deduplication Test: should update target medicine_id smoothly without unique violations', async () => {
    const { saveMedicineAliases, getMedicineAliases } = await import('@/actions/medicines');
    mockSession.currentClinicId = clinicA;

    // First save: map "Aladka Xịt 15ml" -> medA1
    await saveMedicineAliases([
      { raw_name: 'Aladka Xịt 15ml', medicine_id: medA1 },
    ]);

    let aliases = await getMedicineAliases();
    const firstMapping = aliases.find((a) => a.raw_name === 'Aladka Xịt 15ml');
    expect(firstMapping).toBeDefined();
    expect(firstMapping!.medicine_id).toBe(medA1);

    // Second save: re-map same raw_name -> medA2 (e.g. user corrected mapping)
    await saveMedicineAliases([
      { raw_name: 'Aladka Xịt 15ml', medicine_id: medA2 },
      { raw_name: 'Panadol Extra Đỏ', medicine_id: medA1 },
    ]);

    aliases = await getMedicineAliases();
    const updatedMapping = aliases.find((a) => a.raw_name === 'Aladka Xịt 15ml');
    expect(updatedMapping).toBeDefined();
    expect(updatedMapping!.medicine_id).toBe(medA2);

    const countMatches = aliases.filter((a) => a.raw_name === 'Aladka Xịt 15ml').length;
    expect(countMatches).toBe(1);
  });

  it('3. Additive Stock Ingestion Test: initial stocks [0, 15, 50] + [20, 10, 5] should equal [20, 25, 55]', async () => {
    const { importMedicineStockBatch } = await import('@/actions/medicines');
    mockSession.currentClinicId = clinicA;

    // Initial stock check
    const { data: initialMeds } = await adminClient
      .from('medicines')
      .select('id, stock_quantity')
      .in('id', [medA1, medA2, medA3])
      .order('id', { ascending: true });

    expect(initialMeds).toBeDefined();
    const medMapBefore = new Map(initialMeds!.map((m) => [m.id, m.stock_quantity]));
    expect(medMapBefore.get(medA1)).toBe(0);
    expect(medMapBefore.get(medA2)).toBe(15);
    expect(medMapBefore.get(medA3)).toBe(50);

    // Execute atomic batch stock import
    const result = await importMedicineStockBatch({
      adjustments: [
        { medicine_id: medA1, quantity: 20 },
        { medicine_id: medA2, quantity: 10 },
        { medicine_id: medA3, quantity: 5 },
      ],
      reason: 'IMPORT_EXCEL',
    });

    expect(result.success).toBe(true);
    expect(result.updated_count).toBe(3);

    // Query updated stock quantities from DB
    const { data: updatedMeds } = await adminClient
      .from('medicines')
      .select('id, stock_quantity')
      .in('id', [medA1, medA2, medA3])
      .order('id', { ascending: true });

    const medMapAfter = new Map(updatedMeds!.map((m) => [m.id, m.stock_quantity]));
    expect(medMapAfter.get(medA1)).toBe(20);
    expect(medMapAfter.get(medA2)).toBe(25);
    expect(medMapAfter.get(medA3)).toBe(55);
  });

  it('4. Inventory Transaction Audit Test: each adjusted medicine must produce an audit log row', async () => {
    // Check inventory_transaction_logs for medA1, medA2, medA3
    const { data: logs, error } = await adminClient
      .from('inventory_transaction_logs')
      .select('*')
      .eq('clinic_id', clinicA)
      .eq('reason', 'IMPORT_EXCEL')
      .in('medicine_id', [medA1, medA2, medA3])
      .order('id', { ascending: true });

    expect(error).toBeNull();
    expect(logs).toBeDefined();
    expect(logs!.length).toBeGreaterThanOrEqual(3);

    const log1 = logs!.find((l) => l.medicine_id === medA1);
    expect(log1).toBeDefined();
    expect(log1!.old_quantity).toBe(0);
    expect(log1!.new_quantity).toBe(20);
    expect(log1!.adjustment).toBe(20);

    const log2 = logs!.find((l) => l.medicine_id === medA2);
    expect(log2).toBeDefined();
    expect(log2!.old_quantity).toBe(15);
    expect(log2!.new_quantity).toBe(25);
    expect(log2!.adjustment).toBe(10);

    const log3 = logs!.find((l) => l.medicine_id === medA3);
    expect(log3).toBeDefined();
    expect(log3!.old_quantity).toBe(50);
    expect(log3!.new_quantity).toBe(55);
    expect(log3!.adjustment).toBe(5);
  });

  it('5. Transaction Rollback Test: foreign clinic medicine ID must abort the batch and commit nothing', async () => {
    const { importMedicineStockBatch } = await import('@/actions/medicines');
    mockSession.currentClinicId = clinicA;

    // Snapshot stock of medA1 before failing call
    const { data: beforeData } = await adminClient
      .from('medicines')
      .select('stock_quantity')
      .eq('id', medA1)
      .single();
    const stockBefore = beforeData!.stock_quantity;

    // Snapshot log count before failing call
    const { count: logCountBefore } = await adminClient
      .from('inventory_transaction_logs')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicA);

    // Attempt batch containing foreign medicine (medB1 belongs to clinicB)
    await expect(
      importMedicineStockBatch({
        adjustments: [
          { medicine_id: medA1, quantity: 50 },
          { medicine_id: medB1, quantity: 50 }, // Foreign clinic! Should trigger abort
        ],
        reason: 'IMPORT_EXCEL',
      })
    ).rejects.toThrow();

    // Verify stock of medA1 remained unchanged
    const { data: afterData } = await adminClient
      .from('medicines')
      .select('stock_quantity')
      .eq('id', medA1)
      .single();
    expect(afterData!.stock_quantity).toBe(stockBefore);

    // Verify no new transaction logs were added
    const { count: logCountAfter } = await adminClient
      .from('inventory_transaction_logs')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', clinicA);
    expect(logCountAfter).toBe(logCountBefore);
  });

  it('6. On-the-fly New Medicine Registration: should register new medicine and initial stock atomically', async () => {
    const { importMedicineStockBatch } = await import('@/actions/medicines');
    mockSession.currentClinicId = clinicA;

    const newMedName = 'Vitamin C 1000mg Effervescent Import Test';
    const result = await importMedicineStockBatch({
      adjustments: [
        { medicine_id: medA1, quantity: 5 },
      ],
      newMedicines: [
        {
          name: newMedName,
          packing_spec: 'Tuýp 10 viên',
          unit: 'Tuýp',
          price: 45000,
          initial_stock: 30,
        },
      ],
      reason: 'IMPORT_EXCEL',
    });

    expect(result.success).toBe(true);
    expect(result.created_count).toBe(1);
    expect(result.created_ids).toHaveLength(1);

    const createdId = result.created_ids[0];

    // Verify medicine in database
    const { data: createdMed } = await adminClient
      .from('medicines')
      .select('*')
      .eq('id', createdId)
      .single();

    expect(createdMed).toBeDefined();
    expect(createdMed!.name).toBe(newMedName);
    expect(createdMed!.stock_quantity).toBe(30);
    expect(createdMed!.clinic_id).toBe(clinicA);

    // Verify initial stock transaction log
    const { data: newMedLog } = await adminClient
      .from('inventory_transaction_logs')
      .select('*')
      .eq('medicine_id', createdId)
      .single();

    expect(newMedLog).toBeDefined();
    expect(newMedLog!.old_quantity).toBe(0);
    expect(newMedLog!.new_quantity).toBe(30);
    expect(newMedLog!.adjustment).toBe(30);
    expect(newMedLog!.reason).toBe('IMPORT_EXCEL');
  });
});

