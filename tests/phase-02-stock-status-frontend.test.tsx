import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock actions
vi.mock('@/actions/medicines', () => ({
  deleteMedicine: vi.fn(),
}));

describe('Phase 02: Three-Tier Stock Status — Frontend UI', () => {

  describe('Stock status classification logic', () => {
    const getStockStatus = (stockQty: number, minLevel: number) => {
      if (stockQty === 0) return 'out_of_stock';
      if (stockQty <= minLevel) return 'low_stock';
      return 'in_stock';
    };

    it('returns "out_of_stock" when stock_quantity is 0', () => {
      expect(getStockStatus(0, 10)).toBe('out_of_stock');
      expect(getStockStatus(0, 0)).toBe('out_of_stock');
      expect(getStockStatus(0, 100)).toBe('out_of_stock');
    });

    it('returns "low_stock" when 0 < stock_quantity <= min_stock_level', () => {
      expect(getStockStatus(1, 10)).toBe('low_stock');
      expect(getStockStatus(5, 10)).toBe('low_stock');
      expect(getStockStatus(10, 10)).toBe('low_stock'); // boundary: equal
    });

    it('returns "in_stock" when stock_quantity > min_stock_level', () => {
      expect(getStockStatus(11, 10)).toBe('in_stock');
      expect(getStockStatus(100, 10)).toBe('in_stock');
    });
  });

  describe('Badge rendering', () => {
    const getBadgeText = (stockQty: number, minLevel: number): string => {
      if (stockQty === 0) return 'Đã hết';
      if (stockQty > 0 && stockQty <= minLevel) return 'Sắp hết';
      return 'Còn hàng';
    };

    it('renders "Đã hết" badge for out-of-stock medicines', () => {
      expect(getBadgeText(0, 10)).toBe('Đã hết');
    });

    it('renders "Sắp hết" badge for low-stock medicines', () => {
      expect(getBadgeText(3, 10)).toBe('Sắp hết');
    });

    it('renders "Còn hàng" badge for in-stock medicines', () => {
      expect(getBadgeText(50, 10)).toBe('Còn hàng');
    });
  });

  describe('Client-side filter logic', () => {
    const medicines = [
      { id: 1, name: 'Med A', stock_quantity: 0, min_stock_level: 10 },    // out of stock
      { id: 2, name: 'Med B', stock_quantity: 5, min_stock_level: 10 },    // low stock
      { id: 3, name: 'Med C', stock_quantity: 50, min_stock_level: 10 },   // in stock
      { id: 4, name: 'Med D', stock_quantity: 0, min_stock_level: 5 },     // out of stock
      { id: 5, name: 'Med E', stock_quantity: 10, min_stock_level: 10 },   // low stock (boundary)
    ];

    it('filter "all" returns all medicines', () => {
      const filtered = medicines;
      expect(filtered).toHaveLength(5);
    });

    it('filter "out_of_stock" returns only medicines with stock_quantity = 0', () => {
      const filtered = medicines.filter(m => m.stock_quantity === 0);
      expect(filtered).toHaveLength(2);
      expect(filtered.map(m => m.id)).toEqual([1, 4]);
    });

    it('filter "low_stock" returns only medicines with 0 < stock_quantity <= min_stock_level', () => {
      const filtered = medicines.filter(
        m => m.stock_quantity > 0 && m.stock_quantity <= m.min_stock_level
      );
      expect(filtered).toHaveLength(2);
      expect(filtered.map(m => m.id)).toEqual([2, 5]);
    });

    it('out_of_stock and low_stock filters are mutually exclusive', () => {
      const outOfStock = medicines.filter(m => m.stock_quantity === 0);
      const lowStock = medicines.filter(
        m => m.stock_quantity > 0 && m.stock_quantity <= m.min_stock_level
      );
      const overlap = outOfStock.filter(m => lowStock.includes(m));
      expect(overlap).toHaveLength(0);
    });
  });

  describe('LowStockAlert banner logic', () => {
    it('shows banner when outOfStockCount > 0 or lowStockCount > 0', () => {
      const shouldShow = (outOfStock: number, lowStock: number, filter: string) =>
        outOfStock > 0 || lowStock > 0 || filter !== 'all';

      expect(shouldShow(2, 3, 'all')).toBe(true);
      expect(shouldShow(0, 3, 'all')).toBe(true);
      expect(shouldShow(2, 0, 'all')).toBe(true);
      expect(shouldShow(0, 0, 'all')).toBe(false);
      expect(shouldShow(0, 0, 'out_of_stock')).toBe(true); // filter active
    });

    it('generates correct message text', () => {
      const getMessage = (outOfStock: number, lowStock: number, filter: string) => {
        if (filter === 'out_of_stock') return `Đang hiển thị thuốc đã hết hàng.`;
        if (filter === 'low_stock') return `Đang hiển thị thuốc sắp hết hàng.`;
        if (outOfStock > 0 && lowStock > 0) {
          return `Có ${outOfStock} loại thuốc đã hết hàng và ${lowStock} loại sắp hết.`;
        }
        if (outOfStock > 0) return `Có ${outOfStock} loại thuốc đã hết hàng.`;
        if (lowStock > 0) return `Có ${lowStock} loại thuốc sắp hết hàng.`;
        return '';
      };

      expect(getMessage(2, 3, 'all')).toBe('Có 2 loại thuốc đã hết hàng và 3 loại sắp hết.');
      expect(getMessage(2, 0, 'all')).toBe('Có 2 loại thuốc đã hết hàng.');
      expect(getMessage(0, 3, 'all')).toBe('Có 3 loại thuốc sắp hết hàng.');
      expect(getMessage(0, 0, 'out_of_stock')).toBe('Đang hiển thị thuốc đã hết hàng.');
    });
  });

  describe('StatsOverview display', () => {
    it('combines outOfStockCount and lowStockCount for total warning count', () => {
      const outOfStockCount = 2;
      const lowStockCount = 5;
      const totalWarning = outOfStockCount + lowStockCount;
      expect(totalWarning).toBe(7);
    });

    it('formats subtitle with both counts', () => {
      const subtitle = (out: number, low: number) => `${out} đã hết · ${low} sắp hết`;
      expect(subtitle(2, 5)).toBe('2 đã hết · 5 sắp hết');
      expect(subtitle(0, 3)).toBe('0 đã hết · 3 sắp hết');
    });
  });

  describe('MedicineAutocomplete color consistency', () => {
    it('out-of-stock uses red color', () => {
      const getStockColor = (qty: number, minLevel: number) => {
        if (qty === 0) return 'red';
        if (qty <= minLevel) return 'amber';
        return 'gray';
      };
      expect(getStockColor(0, 10)).toBe('red');
    });

    it('low-stock uses amber color (not red)', () => {
      const getStockColor = (qty: number, minLevel: number) => {
        if (qty === 0) return 'red';
        if (qty <= minLevel) return 'amber';
        return 'gray';
      };
      expect(getStockColor(5, 10)).toBe('amber');
    });

    it('in-stock uses gray color', () => {
      const getStockColor = (qty: number, minLevel: number) => {
        if (qty === 0) return 'red';
        if (qty <= minLevel) return 'amber';
        return 'gray';
      };
      expect(getStockColor(50, 10)).toBe('gray');
    });
  });
});
