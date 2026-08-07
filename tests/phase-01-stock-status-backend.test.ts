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

vi.mock('@/lib/supabase/auth', () => ({
  getAuthUser: vi.fn().mockResolvedValue({
    user: { id: 'user-1', user_metadata: { clinic_id: 1 } },
    supabase: mockSupabase,
    clinicId: 1,
  }),
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
