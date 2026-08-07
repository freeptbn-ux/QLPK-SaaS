import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PrescriptionItemRow from '../src/components/features/prescriptions/PrescriptionItemRow';
import MedicineList from '../src/components/features/medicines/MedicineList';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { PrescriptionItem } from '../src/types/forms';
import { Medicine } from '../src/types/database';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
  usePathname: vi.fn(),
}));

vi.mock('../src/actions/medicines', () => ({
  deleteMedicine: vi.fn(),
  addMedicine: vi.fn(),
  updateMedicine: vi.fn(),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Phase 03: Decimal Price Integration & Formatting', () => {
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({ refresh: vi.fn(), push: vi.fn() } as any);
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as any);
    vi.mocked(usePathname as any).mockReturnValue('/medicines');
  });

  it('Test 1: Verify PrescriptionItemRow computes total accurately for quantity 10 and unit price 4.7', () => {
    const item: PrescriptionItem = {
      medicine_id: 1,
      medicine_name: 'Thuốc Thử Nghệ',
      packing_spec: 'Hộp 10 vỉ',
      quantity: 10,
      unit_price: 4.7,
    };

    const mockOnUpdate = vi.fn();
    const mockOnRemove = vi.fn();
    const mockOnMedicineClick = vi.fn();

    render(
      <table>
        <tbody>
          <PrescriptionItemRow
            item={item}
            index={0}
            onUpdate={mockOnUpdate}
            onRemove={mockOnRemove}
            onMedicineClick={mockOnMedicineClick}
          />
        </tbody>
      </table>
    );

    // Unit price 4.7 in vi-VN locale is formatted as "4,7"
    expect(screen.getByText('4,7')).toBeInTheDocument();

    // Total = 10 * 4.7 = 47. In vi-VN locale formatted as "47"
    expect(screen.getByText('47')).toBeInTheDocument();
  });

  it('Test 2: Verify MedicineList renders decimal prices properly formatted for Vietnamese locale', () => {
    const mockMedicines: Medicine[] = [
      {
        id: 101,
        name: 'Thuốc Bổ A',
        packing_spec: 'Chai 100ml',
        price: 4.7,
        stock_quantity: 50,
        min_stock_level: 10,
      },
      {
        id: 102,
        name: 'Thuốc Bổ B',
        packing_spec: 'Hộp 20 viên',
        price: 5000,
        stock_quantity: 100,
        min_stock_level: 20,
      },
    ];

    render(
      <MedicineList
        initialData={mockMedicines}
        totalCount={2}
        currentPage={1}
        limit={10}
        totalLowStockCount={0}
      />
    );

    // Price 4.7 formatted as "4,7"
    expect(screen.getByText('4,7')).toBeInTheDocument();

    // Price 5000 formatted as "5.000" (integer price non-regression check)
    expect(screen.getByText('5.000')).toBeInTheDocument();
  });
});
