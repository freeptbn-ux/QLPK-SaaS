import { describe, it, expect, beforeEach } from 'vitest';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface DailyStats {
  clinic_id: number;
  date: string;
  visit_count: number;
  total_revenue: number;
}

interface Prescription {
  clinic_id: number;
  prescription_date: string;
  total_amount: number;
}

function getVNDate(dateStr: string): string {
  return dayjs(dateStr).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
}

class MockDatabase {
  prescriptions: Prescription[] = [];
  stats: DailyStats[] = [];

  // Recalculates the rollup using the same logic as the SQL backfill
  backfill() {
    // Step 1: Wipe stale data (TRUNCATE)
    this.stats = [];

    // Step 2: Re-aggregate from source of truth
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

describe('Clinic Statistics Backfill & Recalculation Verification', () => {
  let db: MockDatabase;

  beforeEach(() => {
    db = new MockDatabase();
    
    // Seed sample prescriptions, including timezone boundaries
    db.prescriptions = [
      // Clinic 1: Day 1 VN (2026-06-01)
      { clinic_id: 1, prescription_date: '2026-05-31T18:30:00Z', total_amount: 150000 }, // 01:30 AM VN
      { clinic_id: 1, prescription_date: '2026-06-01T10:00:00+07:00', total_amount: 200000 }, // 10:00 AM VN
      
      // Clinic 1: Day 2 VN (2026-06-02)
      { clinic_id: 1, prescription_date: '2026-06-01T18:30:00Z', total_amount: 300000 }, // 01:30 AM VN
      
      // Clinic 2: Day 1 VN (2026-06-01)
      { clinic_id: 2, prescription_date: '2026-06-01T12:00:00+07:00', total_amount: 500000 }, // 12:00 PM VN
    ];

    // Wipe daily stats and run the mock backfill to populate stats table from source of truth
    db.backfill();
  });

  it('Test 1: Total visit count matches prescription count per clinic', () => {
    const clinics = Array.from(new Set(db.prescriptions.map(p => p.clinic_id)));
    
    for (const clinicId of clinics) {
      const totalVisitsFromRollup = db.stats
        .filter(s => s.clinic_id === clinicId)
        .reduce((sum, s) => sum + s.visit_count, 0);

      const totalPrescriptions = db.prescriptions
        .filter(p => p.clinic_id === clinicId)
        .length;

      expect(totalVisitsFromRollup).toBe(totalPrescriptions);
    }
  });

  it('Test 2: No orphaned rollup rows', () => {
    for (const stat of db.stats) {
      // Find at least one prescription that matches the clinic_id and the VN date
      const matchingPrescriptions = db.prescriptions.filter(p => {
        return p.clinic_id === stat.clinic_id && getVNDate(p.prescription_date) === stat.date;
      });

      expect(matchingPrescriptions.length).toBeGreaterThan(0);
    }
  });

  it('Test 3: No negative or zero visit counts', () => {
    const nonPositiveRows = db.stats.filter(s => s.visit_count <= 0);
    expect(nonPositiveRows.length).toBe(0);
  });

  it('Test 4: Revenue totals match per clinic', () => {
    const clinics = Array.from(new Set(db.prescriptions.map(p => p.clinic_id)));

    for (const clinicId of clinics) {
      const totalRevenueFromRollup = db.stats
        .filter(s => s.clinic_id === clinicId)
        .reduce((sum, s) => sum + s.total_revenue, 0);

      const totalRevenueFromSource = db.prescriptions
        .filter(p => p.clinic_id === clinicId)
        .reduce((sum, p) => sum + p.total_amount, 0);

      expect(totalRevenueFromRollup).toBe(totalRevenueFromSource);
    }
  });
});
