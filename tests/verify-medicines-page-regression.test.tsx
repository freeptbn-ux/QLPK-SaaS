import { render, screen } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import MedicinesPage from '../src/app/(dashboard)/medicines/page';
import { getAllMedicines, getLowStockMedicines } from '../src/actions/medicines';
import React from 'react';

// Mock dependencies
vi.mock('@/actions/settings', () => ({
  getAllSettings: vi.fn().mockResolvedValue({ clinic_name: 'Phòng Khám Test' }),
}));

vi.mock('../src/actions/medicines', () => ({
  getAllMedicines: vi.fn(),
  getLowStockMedicines: vi.fn(),
}));

vi.mock('@/components/ui/PageHeader', () => ({
  default: ({ title, subtitle }: any) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  ),
}));

vi.mock('@/components/features/medicines/MedicineList', () => ({
  default: ({ initialData, totalCount, currentPage, limit, totalLowStockCount }: any) => (
    <div data-testid="medicine-list">
      <span>Total low stock: {totalLowStockCount}</span>
      <span>Total count: {totalCount}</span>
    </div>
  ),
}));

describe('MedicinesPage & MedicineListWrapper Regression', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders page shell (title/header) correctly', async () => {
    const pageElement = await MedicinesPage({
      searchParams: Promise.resolve({ page: '1', search: '' }),
    });

    render(pageElement);

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByText('Quản lý Kho thuốc')).toBeInTheDocument();
  });

  test('MedicineListWrapper resolves actions and renders list correctly', async () => {
    (getAllMedicines as any).mockResolvedValue({
      data: [{ id: 1, name: 'Paracetamol' }],
      count: 1,
      limit: 10,
    });
    (getLowStockMedicines as any).mockResolvedValue([
      { id: 2, name: 'Aspirin', stock_quantity: 2, min_stock_level: 5 },
    ]);

    const pageElement = await MedicinesPage({
      searchParams: Promise.resolve({ page: '1', search: '' }),
    });

    // Extract the MedicineListWrapper component from the JSX tree
    const wrapperElement = pageElement.props.children[1].props.children.props.children;
    
    // Call the async Server Component function directly to get the resolved JSX
    const resolvedJSX = await wrapperElement.type(wrapperElement.props);

    render(resolvedJSX);

    expect(screen.getByTestId('medicine-list')).toBeInTheDocument();
    expect(screen.getByText('Total low stock: 1')).toBeInTheDocument();
    expect(screen.getByText('Total count: 1')).toBeInTheDocument();

    expect(getAllMedicines).toHaveBeenCalledWith({ page: 1, search: '' });
    expect(getLowStockMedicines).toHaveBeenCalled();
  });

  test('MedicineListWrapper catches error gracefully when getLowStockMedicines rejects', async () => {
    (getAllMedicines as any).mockResolvedValue({
      data: [{ id: 1, name: 'Paracetamol' }],
      count: 1,
      limit: 10,
    });
    (getLowStockMedicines as any).mockRejectedValue(new Error('P0001 Not authorized'));

    const pageElement = await MedicinesPage({
      searchParams: Promise.resolve({ page: '1', search: '' }),
    });

    // Extract the MedicineListWrapper component from the JSX tree
    const wrapperElement = pageElement.props.children[1].props.children.props.children;
    
    // Call the async Server Component function directly to get the resolved JSX
    const resolvedJSX = await wrapperElement.type(wrapperElement.props);

    render(resolvedJSX);

    expect(screen.getByTestId('medicine-list')).toBeInTheDocument();
    expect(screen.getByText('Total low stock: 0')).toBeInTheDocument();
    expect(screen.getByText('Total count: 1')).toBeInTheDocument();

    expect(getAllMedicines).toHaveBeenCalledWith({ page: 1, search: '' });
    expect(getLowStockMedicines).toHaveBeenCalled();
  });
});
