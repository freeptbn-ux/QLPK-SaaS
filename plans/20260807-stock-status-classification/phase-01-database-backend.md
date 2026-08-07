# Phase 01: Database & Backend

Status: ✅ Completed
Dependencies: None

## Objective

Update the PostgreSQL RPC functions and Next.js server actions to support three-tier stock classification:
- **Out of stock**: `stock_quantity = 0`
- **Low stock**: `0 < stock_quantity <= min_stock_level`
- **In stock**: `stock_quantity > min_stock_level`

## Current State

### SQL RPCs (latest versions)

1. **`get_low_stock_count()`** in `20260510_fix_stats_rls.sql` + `20260807_fix_low_stock_count_active_filter.sql`:
   ```sql
   SELECT COUNT(*) FROM medicines
   WHERE clinic_id = get_my_clinic_id()
     AND is_active = true
     AND stock_quantity <= min_stock_level
   ```
   Problem: Counts both `stock_quantity = 0` AND `0 < stock_quantity <= min_stock_level` together.

2. **`get_low_stock_medicines(p_clinic_id)`** in `20260519195600_fix_low_stock_rpc_clinic_param.sql`:
   ```sql
   SELECT * FROM medicines
   WHERE clinic_id = p_clinic_id
     AND is_active = true
     AND stock_quantity <= min_stock_level
   ```
   Problem: Returns both out-of-stock and low-stock medicines without distinction.

### Server Actions

1. **`getLowStockMedicines()`** in `src/actions/medicines.ts:173-190` — calls `get_low_stock_medicines` RPC
2. **`getOverviewStats()`** in `src/actions/statistics.ts:216-256` — calls `get_low_stock_count` RPC, returns `lowStockCount`

## Implementation Steps

### Step 1: Create SQL migration

Create `supabase/migrations/20260807_three_tier_stock_status.sql`:

1. **Update `get_low_stock_count()`** — exclude `stock_quantity = 0`:
   ```sql
   CREATE OR REPLACE FUNCTION get_low_stock_count()
   RETURNS bigint AS $$
   BEGIN
     RETURN (
       SELECT COUNT(*)
       FROM medicines
       WHERE clinic_id = get_my_clinic_id()
         AND is_active = true
         AND stock_quantity > 0
         AND stock_quantity <= min_stock_level
     );
   END;
   $$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
   ```

2. **Create `get_out_of_stock_count()`** — count only `stock_quantity = 0`:
   ```sql
   CREATE OR REPLACE FUNCTION get_out_of_stock_count()
   RETURNS bigint AS $$
   BEGIN
     RETURN (
       SELECT COUNT(*)
       FROM medicines
       WHERE clinic_id = get_my_clinic_id()
         AND is_active = true
         AND stock_quantity = 0
     );
   END;
   $$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
   ```

3. **Update `get_low_stock_medicines(p_clinic_id)`** — exclude `stock_quantity = 0`:
   ```sql
   CREATE OR REPLACE FUNCTION get_low_stock_medicines(p_clinic_id bigint)
   RETURNS SETOF public.medicines
   LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = public
   AS $$
   BEGIN
     IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
     IF p_clinic_id IS NULL THEN RAISE EXCEPTION 'clinic_id missing'; END IF;
     IF NOT EXISTS (
       SELECT 1 FROM public.profiles WHERE id = auth.uid() AND clinic_id = p_clinic_id
     ) THEN RAISE EXCEPTION 'Not authorized for clinic'; END IF;

     RETURN QUERY
     SELECT * FROM public.medicines
     WHERE clinic_id = p_clinic_id
       AND is_active = true
       AND stock_quantity > 0
       AND stock_quantity <= min_stock_level;
   END;
   $$;
   ```

4. **Grant permissions** for `get_out_of_stock_count`:
   ```sql
   REVOKE EXECUTE ON FUNCTION get_out_of_stock_count() FROM public, anon;
   GRANT EXECUTE ON FUNCTION get_out_of_stock_count() TO authenticated;
   ```

### Step 2: Update `src/actions/statistics.ts`

In `getOverviewStats()`:
- Add `supabase.rpc('get_out_of_stock_count')` to the `Promise.all`
- Return `outOfStockCount` in the result object alongside `lowStockCount`

### Step 3: Update `src/app/(dashboard)/medicines/page.tsx`

In `MedicineListWrapper`:
- The `getLowStockMedicines()` now only returns low-stock (not out-of-stock) medicines
- Also query out-of-stock count: count medicines with `stock_quantity === 0` from `initialData`, or add a separate RPC call
- Pass both `totalLowStockCount` and `totalOutOfStockCount` to `MedicineList`

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| CREATE | `supabase/migrations/20260807_three_tier_stock_status.sql` | SQL migration for updated RPCs |
| MODIFY | `src/actions/statistics.ts` | Add `outOfStockCount` to `getOverviewStats()` return |
| MODIFY | `src/app/(dashboard)/medicines/page.tsx` | Pass `totalOutOfStockCount` prop |

## Test Criteria

After completing this phase, create and run the test file below.

### Test File: `tests/phase-01-stock-status-backend.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase
const mockRpc = vi.fn();
const mockSupabase = {
  rpc: mockRpc,
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        gte: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    }),
  }),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

vi.mock('@/actions/auth', () => ({
  getAuthUser: vi.fn().mockResolvedValue({
    user: { id: 'user-1', user_metadata: { clinic_id: 1 } },
    supabase: mockSupabase,
    clinicId: 1,
  }),
}));

describe('Phase 01: Three-Tier Stock Status — Backend Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('get_low_stock_count RPC contract', () => {
    it('should only count medicines where stock_quantity > 0 AND stock_quantity <= min_stock_level', () => {
      // This test verifies the SQL contract:
      // Given medicines: [qty=0, min=10], [qty=5, min=10], [qty=15, min=10]
      // Expected low_stock_count = 1 (only qty=5)
      // The SQL is: stock_quantity > 0 AND stock_quantity <= min_stock_level

      const medicines = [
        { stock_quantity: 0, min_stock_level: 10 },   // out of stock, NOT low stock
        { stock_quantity: 5, min_stock_level: 10 },   // low stock ✓
        { stock_quantity: 15, min_stock_level: 10 },  // in stock
        { stock_quantity: 10, min_stock_level: 10 },  // low stock ✓ (equal to threshold)
      ];

      const lowStockCount = medicines.filter(
        m => m.stock_quantity > 0 && m.stock_quantity <= m.min_stock_level
      ).length;

      expect(lowStockCount).toBe(2);
    });
  });

  describe('get_out_of_stock_count RPC contract', () => {
    it('should only count medicines where stock_quantity = 0', () => {
      const medicines = [
        { stock_quantity: 0, min_stock_level: 10 },   // out of stock ✓
        { stock_quantity: 0, min_stock_level: 5 },    // out of stock ✓
        { stock_quantity: 5, min_stock_level: 10 },   // low stock
        { stock_quantity: 15, min_stock_level: 10 },  // in stock
      ];

      const outOfStockCount = medicines.filter(m => m.stock_quantity === 0).length;

      expect(outOfStockCount).toBe(2);
    });
  });

  describe('getOverviewStats return shape', () => {
    it('should return both lowStockCount and outOfStockCount', async () => {
      mockRpc.mockImplementation((fn: string) => {
        if (fn === 'get_low_stock_count') return { data: 3, error: null };
        if (fn === 'get_out_of_stock_count') return { data: 2, error: null };
        return { data: null, error: null };
      });

      mockSupabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });

      // Import after mocks
      const { getOverviewStats } = await import('@/actions/statistics');
      const stats = await getOverviewStats();

      expect(stats).toHaveProperty('lowStockCount');
      expect(stats).toHaveProperty('outOfStockCount');
      expect(typeof stats.lowStockCount).toBe('number');
      expect(typeof stats.outOfStockCount).toBe('number');
    });
  });

  describe('Three-tier classification logic', () => {
    it('stock_quantity = 0 is "out of stock", not "low stock"', () => {
      const medicine = { stock_quantity: 0, min_stock_level: 10 };
      const isOutOfStock = medicine.stock_quantity === 0;
      const isLowStock = medicine.stock_quantity > 0 && medicine.stock_quantity <= medicine.min_stock_level;

      expect(isOutOfStock).toBe(true);
      expect(isLowStock).toBe(false);
    });

    it('stock_quantity > 0 and <= min_stock_level is "low stock"', () => {
      const medicine = { stock_quantity: 3, min_stock_level: 10 };
      const isOutOfStock = medicine.stock_quantity === 0;
      const isLowStock = medicine.stock_quantity > 0 && medicine.stock_quantity <= medicine.min_stock_level;

      expect(isOutOfStock).toBe(false);
      expect(isLowStock).toBe(true);
    });

    it('stock_quantity > min_stock_level is "in stock"', () => {
      const medicine = { stock_quantity: 50, min_stock_level: 10 };
      const isOutOfStock = medicine.stock_quantity === 0;
      const isLowStock = medicine.stock_quantity > 0 && medicine.stock_quantity <= medicine.min_stock_level;

      expect(isOutOfStock).toBe(false);
      expect(isLowStock).toBe(false);
    });

    it('stock_quantity = min_stock_level (boundary) is "low stock"', () => {
      const medicine = { stock_quantity: 10, min_stock_level: 10 };
      const isOutOfStock = medicine.stock_quantity === 0;
      const isLowStock = medicine.stock_quantity > 0 && medicine.stock_quantity <= medicine.min_stock_level;

      expect(isOutOfStock).toBe(false);
      expect(isLowStock).toBe(true);
    });

    it('min_stock_level = 0 means only stock_quantity = 0 triggers out-of-stock', () => {
      const medicine = { stock_quantity: 0, min_stock_level: 0 };
      const isOutOfStock = medicine.stock_quantity === 0;
      const isLowStock = medicine.stock_quantity > 0 && medicine.stock_quantity <= medicine.min_stock_level;

      expect(isOutOfStock).toBe(true);
      expect(isLowStock).toBe(false); // 0 > 0 is false, so no low stock possible when min=0
    });
  });

  describe('getLowStockMedicines excludes out-of-stock', () => {
    it('should not include medicines with stock_quantity = 0', () => {
      const allMedicines = [
        { id: 1, stock_quantity: 0, min_stock_level: 10 },
        { id: 2, stock_quantity: 5, min_stock_level: 10 },
        { id: 3, stock_quantity: 15, min_stock_level: 10 },
      ];

      // Simulates what the updated get_low_stock_medicines RPC should return
      const lowStockMedicines = allMedicines.filter(
        m => m.stock_quantity > 0 && m.stock_quantity <= m.min_stock_level
      );

      expect(lowStockMedicines).toHaveLength(1);
      expect(lowStockMedicines[0].id).toBe(2);
      expect(lowStockMedicines.find(m => m.stock_quantity === 0)).toBeUndefined();
    });
  });
});
```

### How to run tests

```bash
npx vitest run tests/phase-01-stock-status-backend.test.ts
```

### Expected results
- All classification logic tests pass
- `getOverviewStats` returns both `lowStockCount` and `outOfStockCount`
- `getLowStockMedicines` excludes medicines with `stock_quantity = 0`

---
Next Phase: `phase-02-frontend-ui.md`
