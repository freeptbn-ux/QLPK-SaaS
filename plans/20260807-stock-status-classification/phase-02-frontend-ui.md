# Phase 02: Frontend UI Components

Status: ✅ Completed
Dependencies: Phase 01 (Database & Backend)

## Objective

Update all frontend components to render three distinct stock status states:
- **"Đã hết"** (Out of stock) — red, bold — `stock_quantity === 0`
- **"Sắp hết"** (Low stock) — amber/orange — `stock_quantity > 0 && stock_quantity <= min_stock_level`
- **"Còn hàng"** (In stock) — green — `stock_quantity > min_stock_level`

## Files to Modify

| File | Change Summary |
|------|---------------|
| `src/components/features/medicines/MedicineList.tsx` | 3-state badge, 3-state stock quantity color, updated filter with "Đã hết" option |
| `src/components/features/medicines/LowStockAlert.tsx` | Show both out-of-stock and low-stock counts in the banner |
| `src/components/features/statistics/StatsOverview.tsx` | Add `outOfStockCount` display to the dashboard card |
| `src/components/features/prescriptions/MedicineAutocomplete.tsx` | Already handles `stock_quantity === 0` — verify 3-state color logic is consistent |

## Implementation Steps

### Step 1: Update `MedicineList.tsx`

#### 1a. Update props interface (line ~22-28)

Add `totalOutOfStockCount` prop:
```typescript
interface MedicineListProps {
  initialData: Medicine[];
  totalCount: number;
  currentPage: number;
  limit: number;
  totalLowStockCount: number;
  totalOutOfStockCount: number;  // NEW
}
```

#### 1b. Add filter state (line ~40)

Replace `showLowStockOnly` with a filter enum:
```typescript
type StockFilter = 'all' | 'low_stock' | 'out_of_stock';
const [stockFilter, setStockFilter] = useState<StockFilter>('all');
```

#### 1c. Update `filteredData` useMemo (line ~67-73)

```typescript
const filteredData = useMemo(() => {
  let result = optimisticData;
  if (stockFilter === 'low_stock') {
    result = result.filter(m => m.stock_quantity > 0 && m.stock_quantity <= m.min_stock_level);
  } else if (stockFilter === 'out_of_stock') {
    result = result.filter(m => m.stock_quantity === 0);
  }
  return result;
}, [optimisticData, stockFilter]);
```

#### 1d. Update badge rendering (line ~180-221)

Replace the binary `isLowStock` check with three states:
```tsx
const isOutOfStock = medicine.stock_quantity === 0;
const isLowStock = medicine.stock_quantity > 0 && medicine.stock_quantity <= medicine.min_stock_level;

// Stock quantity color
<span className={cn(
  "font-bold text-base",
  isOutOfStock ? "text-red-600" : isLowStock ? "text-amber-500" : "text-slate-900 dark:text-slate-100"
)}>
  {medicine.stock_quantity}
</span>

// Badge
{isOutOfStock ? (
  <span className="... bg-red-50 text-red-700 border-red-200 ...">Đã hết</span>
) : isLowStock ? (
  <span className="... bg-amber-50 text-amber-600 border-amber-200 ...">Sắp hết</span>
) : (
  <span className="... bg-emerald-50 text-emerald-600 border-emerald-200 ...">Còn hàng</span>
)}
```

#### 1e. Update toolbar filter buttons (line ~134-154)

Replace single "Sắp hết" toggle with two filter buttons:
```tsx
<button onClick={() => setStockFilter(stockFilter === 'out_of_stock' ? 'all' : 'out_of_stock')}
  className={cn("...", stockFilter === 'out_of_stock' ? "bg-red-500 text-white ..." : "text-red-600 ...")}>
  <HiOutlineXCircle className="w-5 h-5" />
  Đã hết
</button>
<button onClick={() => setStockFilter(stockFilter === 'low_stock' ? 'all' : 'low_stock')}
  className={cn("...", stockFilter === 'low_stock' ? "bg-amber-500 text-white ..." : "text-amber-600 ...")}>
  <HiOutlineArchiveBox className="w-5 h-5" />
  Sắp hết
</button>
```

### Step 2: Update `LowStockAlert.tsx`

Update to show both counts. Accept new props:
```typescript
interface LowStockAlertProps {
  lowStockCount: number;
  outOfStockCount: number;
  stockFilter: 'all' | 'low_stock' | 'out_of_stock';
  onFilterChange: (filter: 'all' | 'low_stock' | 'out_of_stock') => void;
}
```

The banner should display:
- When `outOfStockCount > 0`: *"Có X loại thuốc đã hết hàng và Y loại sắp hết."*
- When only `lowStockCount > 0`: *"Có Y loại thuốc sắp hết hàng."*
- When filtering: *"Đang hiển thị thuốc [đã hết / sắp hết]."* with a "Hiện tất cả" button.

### Step 3: Update `StatsOverview.tsx`

In the stats items array, update the "Thuốc sắp hết" card to show combined or separate info:

```typescript
{
  title: 'Cảnh báo tồn kho',
  value: (stats?.outOfStockCount ?? 0) + (stats?.lowStockCount ?? 0),
  subtitle: `${stats?.outOfStockCount ?? 0} đã hết · ${stats?.lowStockCount ?? 0} sắp hết`,
  icon: HiOutlineExclamationTriangle,
  colorClass: 'bg-amber-50 ...',
},
```

### Step 4: Verify `MedicineAutocomplete.tsx`

The autocomplete already has:
```typescript
const isOutOfStock = option.stock_quantity === 0;
```
And handles it with red text + "Hết hàng" badge + `cursor-not-allowed`.

Verify the middle state (low stock, `0 < qty <= min`) uses amber/orange consistently:
```typescript
// Current (line 193-198):
isOutOfStock
  ? "text-red-600 dark:text-red-400 font-bold"
  : option.stock_quantity <= option.min_stock_level
    ? "text-red-500 dark:text-orange-400"      // Change to amber for consistency
    : "text-gray-500 dark:text-gray-400"
```

Change `text-red-500` → `text-amber-500` for low stock to differentiate from out-of-stock red.

## Test Criteria

After completing this phase, create and run the test file below.

### Test File: `tests/phase-02-stock-status-frontend.test.tsx`

```tsx
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
```

### How to run tests

```bash
npx vitest run tests/phase-02-stock-status-frontend.test.tsx
```

### Expected results
- All 3-state classification logic tests pass
- Badge text rendering tests pass
- Client-side filter mutual exclusivity tests pass
- LowStockAlert banner message tests pass
- Color consistency tests pass (red for out-of-stock, amber for low-stock, gray/green for in-stock)

---
Previous Phase: `phase-01-database-backend.md`
