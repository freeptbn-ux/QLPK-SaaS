import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const sampleCatalog = [
  { id: 1, name: 'Paracetamol 500mg vỉ xanh', unit: 'Vỉ', price: 12000, stock_quantity: 20, min_stock_level: 5, is_active: true },
  { id: 2, name: 'Paracetamol DHG 150mg', unit: 'Gói', price: 1500, stock_quantity: 100, min_stock_level: 10, is_active: true },
  { id: 3, name: 'Aubactam 281', unit: 'Lọ', price: 45000, stock_quantity: 15, min_stock_level: 3, is_active: true },
  { id: 4, name: 'Deslotid 30ml siro', unit: 'Chai', price: 35000, stock_quantity: 0, min_stock_level: 2, is_active: true }, // Out of stock
];

// Mock catalog hook
vi.mock('@/hooks/useMedicineCatalog', () => ({
  useMedicineCatalog: () => ({
    medicines: sampleCatalog,
    isLoading: false,
    error: null,
  }),
}));

// Mock toast
const mockShowToast = vi.fn();
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

describe('Phase 02: Zero-Latency In-Memory Vietnamese Token Search & Autocomplete UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Requirement: should filter options synchronously upon keystroke without network delay', async () => {
    const { MedicineAutocomplete } = await import('@/components/features/prescriptions/MedicineAutocomplete');
    const onSelect = vi.fn();

    render(React.createElement(MedicineAutocomplete, { onSelect }));
    const input = screen.getByRole('combobox');

    // Type query
    fireEvent.change(input, { target: { value: 'para' } });

    // Results must appear immediately without waiting for timers or network
    expect(screen.getByText('Paracetamol 500mg vỉ xanh')).toBeInTheDocument();
    expect(screen.getByText('Paracetamol DHG 150mg')).toBeInTheDocument();
    expect(screen.queryByText('Aubactam 281')).not.toBeInTheDocument();
  });

  it('Requirement: should support multi-word tokenized search with Vietnamese unaccented matching', async () => {
    const { MedicineAutocomplete } = await import('@/components/features/prescriptions/MedicineAutocomplete');
    const onSelect = vi.fn();

    render(React.createElement(MedicineAutocomplete, { onSelect }));
    const input = screen.getByRole('combobox');

    // Multi-word unaccented search
    fireEvent.change(input, { target: { value: 'vi xanh 500' } });

    expect(screen.getByText('Paracetamol 500mg vỉ xanh')).toBeInTheDocument();
    expect(screen.queryByText('Paracetamol DHG 150mg')).not.toBeInTheDocument();
  });

  it('Requirement: should exclude IDs specified in excludeIds prop', async () => {
    const { MedicineAutocomplete } = await import('@/components/features/prescriptions/MedicineAutocomplete');
    const onSelect = vi.fn();

    render(React.createElement(MedicineAutocomplete, { onSelect, excludeIds: [1] }));
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'paracetamol' } });

    expect(screen.queryByText('Paracetamol 500mg vỉ xanh')).not.toBeInTheDocument();
    expect(screen.getByText('Paracetamol DHG 150mg')).toBeInTheDocument();
  });

  it('Requirement: should prevent selection of out-of-stock items and alert user', async () => {
    const { MedicineAutocomplete } = await import('@/components/features/prescriptions/MedicineAutocomplete');
    const onSelect = vi.fn();

    render(React.createElement(MedicineAutocomplete, { onSelect }));
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'deslotid' } });

    const outOfStockItem = screen.getByText('Deslotid 30ml siro');
    fireEvent.click(outOfStockItem);

    expect(onSelect).not.toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith(expect.stringContaining('hết hàng'), 'error');
  });

  it('Requirement: should navigate options via Arrow keys and select using Enter key', async () => {
    const { MedicineAutocomplete } = await import('@/components/features/prescriptions/MedicineAutocomplete');
    const onSelect = vi.fn();

    render(React.createElement(MedicineAutocomplete, { onSelect }));
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'para' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSelect).toHaveBeenCalledWith(sampleCatalog[0]);
  });
});
