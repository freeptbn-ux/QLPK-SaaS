import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock the medicine action module
const mockSearchMedicines = vi.fn();
const mockGetAllActiveMedicines = vi.fn();

vi.mock('@/actions/medicines', () => ({
  searchMedicines: (...args: any[]) => mockSearchMedicines(...args),
  getAllActiveMedicines: (...args: any[]) => mockGetAllActiveMedicines(...args),
}));

describe('Phase 05: Medicine Autocomplete Client Overhead Elimination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Requirement PERF-007: should NOT load all active medicines on component mount', async () => {
    // Dynamic import of the autocomplete component
    const { MedicineAutocomplete } = await import('@/components/prescriptions/MedicineAutocomplete');

    render(
      React.createElement(MedicineAutocomplete, {
        value: '',
        onChange: vi.fn(),
        onSelect: vi.fn(),
      })
    );

    // Verify that getAllActiveMedicines was NEVER called on mount
    expect(mockGetAllActiveMedicines).not.toHaveBeenCalled();
  });

  it('Requirement PERF-007: should execute debounced search and limit results to <= 20', async () => {
    const mockResults = [
      { id: 'm1', name: 'Paracetamol 500mg', unit: 'Viên', price: 1000, stock_quantity: 50 },
      { id: 'm2', name: 'Panadol Extra', unit: 'Viên', price: 2000, stock_quantity: 30 },
    ];
    mockSearchMedicines.mockResolvedValue({ data: mockResults, error: null });

    const { MedicineAutocomplete } = await import('@/components/prescriptions/MedicineAutocomplete');

    render(
      React.createElement(MedicineAutocomplete, {
        value: '',
        onChange: vi.fn(),
        onSelect: vi.fn(),
      })
    );

    const input = screen.getByRole('combobox') || screen.getByPlaceholderText(/tìm|thuốc/i);
    expect(input).toBeDefined();

    // Type search query
    fireEvent.change(input, { target: { value: 'para' } });

    // Wait for debounced search execution
    await waitFor(() => {
      expect(mockSearchMedicines).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'para',
          limit: expect.any(Number),
        })
      );
    });

    const callArgs = mockSearchMedicines.mock.calls[0][0];
    expect(callArgs.limit).toBeLessThanOrEqual(20);
  });

  it('Requirement PERF-007: should discard stale in-flight requests during rapid typing', async () => {
    // Simulate delayed response for first query and fast response for second query
    let resolveFirst: any;
    const firstPromise = new Promise((res) => { resolveFirst = res; });
    const secondPromise = Promise.resolve({
      data: [{ id: 'm3', name: 'Amoxicillin 500mg', unit: 'Viên', price: 1500, stock_quantity: 20 }],
      error: null,
    });

    mockSearchMedicines
      .mockReturnValueOnce(firstPromise)
      .mockReturnValueOnce(secondPromise);

    const { MedicineAutocomplete } = await import('@/components/prescriptions/MedicineAutocomplete');

    render(
      React.createElement(MedicineAutocomplete, {
        value: '',
        onChange: vi.fn(),
        onSelect: vi.fn(),
      })
    );

    const input = screen.getByRole('combobox') || screen.getByPlaceholderText(/tìm|thuốc/i);

    // Rapid typing
    fireEvent.change(input, { target: { value: 'par' } });
    fireEvent.change(input, { target: { value: 'amox' } });

    // Wait for second search to display
    await waitFor(() => {
      expect(screen.getByText(/Amoxicillin 500mg/i)).toBeDefined();
    });

    // Resolve late first promise
    resolveFirst({
      data: [{ id: 'm1', name: 'Paracetamol 500mg', unit: 'Viên', price: 1000, stock_quantity: 50 }],
      error: null,
    });

    // Late first query should NOT overwrite the second query results
    await waitFor(() => {
      expect(screen.queryByText(/Paracetamol 500mg/i)).toBeNull();
      expect(screen.getByText(/Amoxicillin 500mg/i)).toBeDefined();
    });
  });

  it('Requirement PERF-007: should select a medicine via click and trigger onSelect callback', async () => {
    const mockOnSelect = vi.fn();
    const selectedMedicine = { id: 10, name: 'Cefixime 200mg', unit: 'Viên', price: 5000, stock_quantity: 25 };
    mockSearchMedicines.mockResolvedValue({
      data: [selectedMedicine],
      error: null,
    });

    const { MedicineAutocomplete } = await import('@/components/prescriptions/MedicineAutocomplete');

    render(
      React.createElement(MedicineAutocomplete, {
        value: '',
        onChange: vi.fn(),
        onSelect: mockOnSelect,
      })
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'cefixime' } });

    await waitFor(() => {
      expect(screen.getByText(/Cefixime 200mg/i)).toBeDefined();
    });

    fireEvent.click(screen.getByText(/Cefixime 200mg/i));

    expect(mockOnSelect).toHaveBeenCalledWith(selectedMedicine);
  });

  it('Requirement PERF-007: should support keyboard navigation and select via Enter key', async () => {
    const mockOnSelect = vi.fn();
    const medicines = [
      { id: 1, name: 'Ibuprofen 400mg', unit: 'Viên', price: 1200, stock_quantity: 40 },
      { id: 2, name: 'Aspirin 81mg', unit: 'Viên', price: 800, stock_quantity: 100 },
    ];
    mockSearchMedicines.mockResolvedValue({
      data: medicines,
      error: null,
    });

    const { MedicineAutocomplete } = await import('@/components/prescriptions/MedicineAutocomplete');

    render(
      React.createElement(MedicineAutocomplete, {
        value: '',
        onChange: vi.fn(),
        onSelect: mockOnSelect,
      })
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'ibu' } });

    await waitFor(() => {
      expect(screen.getByText(/Ibuprofen 400mg/i)).toBeDefined();
    });

    // Press ArrowDown to navigate to first option and Enter to select
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnSelect).toHaveBeenCalledWith(medicines[0]);
  });

  it('Requirement PERF-007: should prevent selection of out-of-stock medicines', async () => {
    const mockOnSelect = vi.fn();
    const outOfStockMedicine = { id: 99, name: 'Rare Antibiotic', unit: 'Lọ', price: 50000, stock_quantity: 0 };
    mockSearchMedicines.mockResolvedValue({
      data: [outOfStockMedicine],
      error: null,
    });

    const { MedicineAutocomplete } = await import('@/components/prescriptions/MedicineAutocomplete');

    render(
      React.createElement(MedicineAutocomplete, {
        value: '',
        onChange: vi.fn(),
        onSelect: mockOnSelect,
      })
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'rare' } });

    await waitFor(() => {
      expect(screen.getByText(/Rare Antibiotic/i)).toBeDefined();
      expect(screen.getByText(/Hết hàng/i)).toBeDefined();
    });

    fireEvent.click(screen.getByText(/Rare Antibiotic/i));

    // Must NOT select out of stock medicine
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('Requirement PERF-007: should filter out excludeIds from suggestions', async () => {
    const medicines = [
      { id: 1, name: 'Med 1', unit: 'Viên', price: 1000, stock_quantity: 10 },
      { id: 2, name: 'Med 2', unit: 'Viên', price: 2000, stock_quantity: 20 },
    ];
    mockSearchMedicines.mockResolvedValue({
      data: medicines,
      error: null,
    });

    const { MedicineAutocomplete } = await import('@/components/prescriptions/MedicineAutocomplete');

    render(
      React.createElement(MedicineAutocomplete, {
        value: '',
        onChange: vi.fn(),
        onSelect: vi.fn(),
        excludeIds: [1],
      })
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Med' } });

    await waitFor(() => {
      expect(screen.getByText('Med 2')).toBeDefined();
    });

    expect(screen.queryByText('Med 1')).toBeNull();
  });
});
