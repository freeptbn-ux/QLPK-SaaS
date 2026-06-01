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
  stats: DailyStats[] = [];

  getStats(clinicId: number, date: string): DailyStats | undefined {
    return this.stats.find(s => s.clinic_id === clinicId && s.date === date);
  }

  // Mimics the SQL UPSERT and standard INSERT/UPDATE/DELETE behavior of the trigger function
  upsertStats(clinicId: number, date: string, visitCountDelta: number, revenueDelta: number, shouldCleanup = false) {
    let row = this.getStats(clinicId, date);
    if (!row) {
      row = { clinic_id: clinicId, date, visit_count: 0, total_revenue: 0 };
      this.stats.push(row);
    }
    row.visit_count += visitCountDelta;
    row.total_revenue += revenueDelta;

    // Cleanup: remove row if visit_count <= 0 and shouldCleanup is true
    if (shouldCleanup && row.visit_count <= 0) {
      this.stats = this.stats.filter(s => !(s.clinic_id === clinicId && s.date === date));
    }
  }

  insertPrescription(prescription: Prescription) {
    const v_date = getVNDate(prescription.prescription_date);
    this.upsertStats(prescription.clinic_id, v_date, 1, prescription.total_amount, false);
  }

  deletePrescription(prescription: Prescription) {
    const v_date = getVNDate(prescription.prescription_date);
    this.upsertStats(prescription.clinic_id, v_date, -1, -prescription.total_amount, true);
  }

  updatePrescription(oldPrescription: Prescription, newPrescription: Prescription) {
    const v_old_date = getVNDate(oldPrescription.prescription_date);
    const v_new_date = getVNDate(newPrescription.prescription_date);

    if (v_old_date !== v_new_date || oldPrescription.clinic_id !== newPrescription.clinic_id) {
      // Decrement old and clean up
      this.upsertStats(oldPrescription.clinic_id, v_old_date, -1, -oldPrescription.total_amount, true);
      
      // Increment new (using UPSERT logic)
      this.upsertStats(newPrescription.clinic_id, v_new_date, 1, newPrescription.total_amount, false);
    } else {
      // Same day, same clinic: adjust revenue (UPSERT logic in trigger ensures missing rollup rows are created)
      this.upsertStats(newPrescription.clinic_id, v_new_date, 0, newPrescription.total_amount - oldPrescription.total_amount, false);
    }
  }
}

describe('fn_sync_clinic_daily_stats Trigger Logic Mock Test', () => {
  let db: MockDatabase;

  beforeEach(() => {
    db = new MockDatabase();
  });

  it('Test 1: Timezone-aware date extraction', () => {
    // 2026-06-01T01:30:00+07:00 in Vietnam is 2026-06-01
    // The UTC string for it would be 2026-05-31T18:30:00Z
    const utcDateStr = '2026-05-31T18:30:00Z';
    const vnDate = getVNDate(utcDateStr);
    expect(vnDate).toBe('2026-06-01');
  });

  it('Test 2: INSERT creates rollup row', () => {
    const p: Prescription = {
      clinic_id: 1,
      prescription_date: '2026-05-31T18:30:00Z', // Vietnam 2026-06-01
      total_amount: 150000,
    };
    db.insertPrescription(p);
    const stats = db.getStats(1, '2026-06-01');
    expect(stats).toBeDefined();
    expect(stats?.visit_count).toBe(1);
    expect(stats?.total_revenue).toBe(150000);
  });

  it('Test 3: DELETE removes rollup row when last visit', () => {
    const p: Prescription = {
      clinic_id: 1,
      prescription_date: '2026-06-01T10:00:00+07:00',
      total_amount: 200000,
    };
    db.insertPrescription(p);
    
    // Check rollup exists
    expect(db.getStats(1, '2026-06-01')).toBeDefined();

    // Delete last prescription
    db.deletePrescription(p);

    // Rollup row should be fully removed, not left with visit_count = 0
    const stats = db.getStats(1, '2026-06-01');
    expect(stats).toBeUndefined();
  });

  it('Test 4: UPDATE same-day adjusts revenue only', () => {
    const pOld: Prescription = {
      clinic_id: 1,
      prescription_date: '2026-06-01T10:00:00+07:00',
      total_amount: 200000,
    };
    db.insertPrescription(pOld);

    const pNew: Prescription = {
      clinic_id: 1,
      prescription_date: '2026-06-01T15:00:00+07:00',
      total_amount: 250000,
    };
    db.updatePrescription(pOld, pNew);

    const stats = db.getStats(1, '2026-06-01');
    expect(stats).toBeDefined();
    expect(stats?.visit_count).toBe(1);
    expect(stats?.total_revenue).toBe(250000);
  });

  it('Test 5: UPDATE cross-day moves visit correctly', () => {
    // Insert prescription on day 1
    const pOld: Prescription = {
      clinic_id: 1,
      prescription_date: '2026-06-01T10:00:00+07:00',
      total_amount: 200000,
    };
    db.insertPrescription(pOld);

    // Update to day 2
    const pNew: Prescription = {
      clinic_id: 1,
      prescription_date: '2026-06-02T10:00:00+07:00',
      total_amount: 150000,
    };
    db.updatePrescription(pOld, pNew);

    // Old day should be decremented and cleaned up (since visit_count drops to 0)
    expect(db.getStats(1, '2026-06-01')).toBeUndefined();

    // New day should have the visit and revenue
    const statsNew = db.getStats(1, '2026-06-02');
    expect(statsNew).toBeDefined();
    expect(statsNew?.visit_count).toBe(1);
    expect(statsNew?.total_revenue).toBe(150000);
  });

  it('Test 6: UPDATE with missing rollup row uses UPSERT', () => {
    const pOld: Prescription = {
      clinic_id: 1,
      prescription_date: '2026-06-01T10:00:00+07:00',
      total_amount: 200000,
    };
    // Note: Old row was not inserted (simulating manual DB deletion or missing rollup row)
    
    const pNew: Prescription = {
      clinic_id: 1,
      prescription_date: '2026-06-01T12:00:00+07:00',
      total_amount: 250000,
    };

    // Updating same day when the rollup row is missing.
    // The trigger should execute UPSERT, successfully creating the row.
    db.updatePrescription(pOld, pNew);

    const stats = db.getStats(1, '2026-06-01');
    expect(stats).toBeDefined();
    expect(stats?.visit_count).toBe(0); // visit_count remains 0 (since it was same-day revenue adjustment)
    expect(stats?.total_revenue).toBe(50000); // 250000 - 200000
  });
});
