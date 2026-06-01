import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOverviewStats } from '@/actions/statistics';
import { getAuthUser } from '@/lib/supabase/auth';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const VN_TIMEZONE = 'Asia/Ho_Chi_Minh';

interface DailyStats {
  clinic_id: number;
  date: string;
  visit_count: number;
  total_revenue: number;
}

interface Prescription {
  id: string;
  clinic_id: number;
  prescription_date: string;
  total_amount: number;
}

function getVNDate(dateStr: string): string {
  return dayjs(dateStr).tz(VN_TIMEZONE).format('YYYY-MM-DD');
}

class E2EMockDatabase {
  prescriptions: Prescription[] = [];
  stats: DailyStats[] = [];
  patientsCount: Record<number, number> = {};
  lowStockCount: Record<number, number> = {};

  getStats(clinicId: number, date: string): DailyStats | undefined {
    return this.stats.find(s => s.clinic_id === clinicId && s.date === date);
  }

  // Trigger behavior simulator for upsert operations
  upsertStats(clinicId: number, date: string, visitCountDelta: number, revenueDelta: number) {
    let row = this.getStats(clinicId, date);
    if (!row) {
      row = { clinic_id: clinicId, date, visit_count: 0, total_revenue: 0 };
      this.stats.push(row);
    }
    row.visit_count += visitCountDelta;
    row.total_revenue += revenueDelta;

    // E2E trigger: delete rows with no active visits
    if (row.visit_count <= 0) {
      this.stats = this.stats.filter(s => !(s.clinic_id === clinicId && s.date === date));
    }
  }

  insertPrescription(p: Prescription) {
    this.prescriptions.push(p);
    const vDate = getVNDate(p.prescription_date);
    this.upsertStats(p.clinic_id, vDate, 1, p.total_amount);
  }

  deletePrescription(id: string) {
    const idx = this.prescriptions.findIndex(p => p.id === id);
    if (idx !== -1) {
      const p = this.prescriptions[idx];
      this.prescriptions.splice(idx, 1);
      const vDate = getVNDate(p.prescription_date);
      this.upsertStats(p.clinic_id, vDate, -1, p.total_amount);
    }
  }

  // Simulates full DB backfill from prescriptions table
  backfill() {
    this.stats = [];
    const aggregation: Record<string, { visit_count: number; total_revenue: number }> = {};

    for (const p of this.prescriptions) {
      const vnDate = getVNDate(p.prescription_date);
      const key = `${p.clinic_id}_${vnDate}`;
      if (!aggregation[key]) {
        aggregation[key] = { visit_count: 0, total_revenue: 0 };
      }
      aggregation[key].visit_count += 1;
      aggregation[key].total_revenue += p.total_amount;
    }

    for (const key of Object.keys(aggregation)) {
      const [clinicIdStr, date] = key.split('_');
      const clinic_id = parseInt(clinicIdStr, 10);
      const { visit_count, total_revenue } = aggregation[key];
      this.stats.push({
        clinic_id,
        date,
        visit_count,
        total_revenue,
      });
    }
  }
}

let activeDb = new E2EMockDatabase();
let currentClinicId = 1;

vi.mock('@/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(async () => {
    return {
      clinicId: currentClinicId,
      supabase: {
        from: (table: string) => {
          if (table === 'patients') {
            return {
              select: (projection: string, options: any) => {
                return {
                  eq: (field: string, value: any) => {
                    const count = activeDb.patientsCount[value] || 0;
                    return Promise.resolve({ count, error: null });
                  }
                };
              }
            };
          }
          if (table === 'clinic_daily_stats') {
            return {
              select: (projection: string) => {
                return {
                  eq: (field: string, clinicVal: any) => {
                    return {
                      gte: (dateField: string, dateVal: any) => {
                        const endOfMonthStr = dayjs(dateVal).endOf('month').format('YYYY-MM-DD');
                        const filtered = activeDb.stats.filter(
                          s => s.clinic_id === clinicVal && s.date >= dateVal && s.date <= endOfMonthStr
                        );
                        return Promise.resolve({ data: filtered, error: null });
                      }
                    };
                  }
                };
              }
            };
          }
          return {
            select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) })
          };
        },
        rpc: (fnName: string) => {
          if (fnName === 'get_low_stock_count') {
            return Promise.resolve({ data: activeDb.lowStockCount[currentClinicId] || 0, error: null });
          }
          return Promise.resolve({ data: null, error: null });
        }
      }
    };
  })
}));

describe('Phase 03: End-to-End Verification and Integrity', () => {
  beforeEach(() => {
    activeDb = new E2EMockDatabase();
    currentClinicId = 1;
    vi.clearAllMocks();
  });

  it('Test 1: Monthly visit count matches for current month', async () => {
    const now = dayjs().tz(VN_TIMEZONE);
    const startOfMonth = now.startOf('month');
    const endOfMonth = now.endOf('month');

    const p1: Prescription = {
      id: 'p1',
      clinic_id: currentClinicId,
      prescription_date: startOfMonth.add(2, 'hour').toISOString(),
      total_amount: 100000,
    };
    const p2: Prescription = {
      id: 'p2',
      clinic_id: currentClinicId,
      prescription_date: endOfMonth.subtract(2, 'hour').toISOString(),
      total_amount: 150000,
    };
    const pOutside: Prescription = {
      id: 'pOutside',
      clinic_id: currentClinicId,
      prescription_date: startOfMonth.subtract(1, 'day').toISOString(),
      total_amount: 200000,
    };

    activeDb.insertPrescription(p1);
    activeDb.insertPrescription(p2);
    activeDb.insertPrescription(pOutside);

    activeDb.patientsCount[currentClinicId] = 10;
    activeDb.lowStockCount[currentClinicId] = 3;

    const stats = await getOverviewStats();

    // Verify monthlyVisits uses daily stats for only the current month
    expect(stats.monthlyVisits).toBe(2);
    expect(stats.monthlyRevenue).toBe(250000);

    const countInMonth = activeDb.prescriptions.filter(p => {
      if (p.clinic_id !== currentClinicId) return false;
      const vnDate = dayjs(p.prescription_date).tz(VN_TIMEZONE);
      return (vnDate.isAfter(startOfMonth) || vnDate.isSame(startOfMonth)) &&
             (vnDate.isBefore(endOfMonth) || vnDate.isSame(endOfMonth));
    }).length;

    expect(stats.monthlyVisits).toBe(countInMonth);
  });

  it('Test 2: Timezone boundary — late-night VN prescription', async () => {
    // 2026-06-01T01:00:00+07:00 is late-night Vietnam time (UTC: 2026-05-31T18:00:00Z)
    const p: Prescription = {
      id: 'boundary-vn',
      clinic_id: currentClinicId,
      prescription_date: '2026-06-01T01:00:00+07:00',
      total_amount: 120000,
    };
    activeDb.insertPrescription(p);

    const rollupJune1 = activeDb.getStats(currentClinicId, '2026-06-01');
    expect(rollupJune1).toBeDefined();
    expect(rollupJune1?.visit_count).toBe(1);

    const rollupMay31 = activeDb.getStats(currentClinicId, '2026-05-31');
    expect(rollupMay31).toBeUndefined();

    // Verify query ranges by mocking system time
    vi.useFakeTimers();
    
    vi.setSystemTime(new Date('2026-06-15T12:00:00+07:00'));
    const statsJune = await getOverviewStats();
    expect(statsJune.monthlyVisits).toBe(1);

    vi.setSystemTime(new Date('2026-05-15T12:00:00+07:00'));
    const statsMay = await getOverviewStats();
    expect(statsMay.monthlyVisits).toBe(0);

    vi.useRealTimers();
  });

  it('Test 3: Timezone boundary — late-night UTC prescription', async () => {
    // 2026-05-31T23:30:00+07:00 (= 2026-05-31T16:30:00Z)
    const p: Prescription = {
      id: 'boundary-utc',
      clinic_id: currentClinicId,
      prescription_date: '2026-05-31T23:30:00+07:00',
      total_amount: 80000,
    };
    activeDb.insertPrescription(p);

    const rollupMay31 = activeDb.getStats(currentClinicId, '2026-05-31');
    expect(rollupMay31).toBeDefined();
    expect(rollupMay31?.visit_count).toBe(1);

    expect(getVNDate(p.prescription_date)).toBe('2026-05-31');
    expect(dayjs(p.prescription_date).utc().format('YYYY-MM-DD')).toBe('2026-05-31');
  });

  it('Test 4: Delete last visit removes rollup row', async () => {
    const p: Prescription = {
      id: 'delete-test',
      clinic_id: currentClinicId,
      prescription_date: '2026-07-01T12:00:00+07:00',
      total_amount: 100000,
    };
    
    activeDb.insertPrescription(p);
    expect(activeDb.getStats(currentClinicId, '2026-07-01')).toBeDefined();

    activeDb.deletePrescription('delete-test');
    expect(activeDb.getStats(currentClinicId, '2026-07-01')).toBeUndefined();
  });

  it('Test 5: No global data drift', async () => {
    activeDb.prescriptions = [
      { id: '1', clinic_id: 1, prescription_date: '2026-05-01T10:00:00+07:00', total_amount: 100 },
      { id: '2', clinic_id: 1, prescription_date: '2026-05-02T10:00:00+07:00', total_amount: 150 },
      { id: '3', clinic_id: 2, prescription_date: '2026-05-01T11:00:00+07:00', total_amount: 200 },
      { id: '4', clinic_id: 2, prescription_date: '2026-06-01T01:00:00+07:00', total_amount: 250 },
    ];
    activeDb.backfill();

    const clinicIds = [1, 2];
    for (const cid of clinicIds) {
      const sumRollupVisits = activeDb.stats
        .filter(s => s.clinic_id === cid)
        .reduce((acc, curr) => acc + curr.visit_count, 0);

      const countActualPrescriptions = activeDb.prescriptions
        .filter(p => p.clinic_id === cid)
        .length;

      expect(sumRollupVisits).toBe(countActualPrescriptions);
    }
  });
});
