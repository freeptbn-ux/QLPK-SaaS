import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import MedicineUsageDialog from '@/components/features/patients/MedicineUsageDialog';
import React from 'react';

// Mock getMedicineUsageByPatient action
vi.mock('@/actions/patients', () => ({
  getMedicineUsageByPatient: vi.fn(),
}));

import { getMedicineUsageByPatient } from '@/actions/patients';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('MedicineUsageDialog - Phase 01 & 02 Tests', () => {
  const mockOnClose = vi.fn();
  const mockPatientId = 123;
  const mockPatientName = 'Nguyen Van A';

  beforeEach(() => {
    vi.clearAllMocks();
    (getMedicineUsageByPatient as any).mockResolvedValue([
      { medicine_name: 'Panadol', packing_spec: 'Vỉ 10 viên', times_prescribed: 5 },
      { medicine_name: 'Amoxicillin', packing_spec: 'Hộp 20 viên', times_prescribed: 2 }
    ]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders header with title attribute and wraps appropriately', async () => {
    render(
      <MedicineUsageDialog
        open={true}
        onClose={mockOnClose}
        patientId={mockPatientId}
        patientName={mockPatientName}
      />
    );

    // Wait for the data to load and render to avoid act warning
    await screen.findByRole('table');

    // 1. Title Wrap Test
    const titleElement = screen.getByTitle(`Lịch sử dùng thuốc: ${mockPatientName}`);
    expect(titleElement).toBeDefined();
    expect(titleElement.textContent).toContain(`Lịch sử dùng thuốc: ${mockPatientName}`);
    expect(titleElement.className).toContain('whitespace-normal');
    expect(titleElement.className).toContain('line-clamp-2');
  });

  it('toggles search input field when clicking magnifying glass button', async () => {
    render(
      <MedicineUsageDialog
        open={true}
        onClose={mockOnClose}
        patientId={mockPatientId}
        patientName={mockPatientName}
      />
    );

    // Wait for data load
    await screen.findByRole('table');

    // Initially search input should not be in the DOM
    expect(screen.queryByPlaceholderText('Tìm kiếm thuốc...')).toBeNull();

    // Click magnifying glass button to show search input
    const searchBtn = screen.getByRole('button', { name: /toggle search/i });
    fireEvent.click(searchBtn);

    // Search input should now be in the DOM
    const input = screen.getByPlaceholderText('Tìm kiếm thuốc...') as HTMLInputElement;
    expect(input).toBeDefined();

    // Type something to show clear button
    fireEvent.change(input, { target: { value: 'Panadol' } });
    expect(input.value).toBe('Panadol');
    
    const clearBtn = screen.getByRole('button', { name: /clear search/i });
    expect(clearBtn).toBeDefined();

    // Click clear button
    fireEvent.click(clearBtn);
    expect(input.value).toBe('');

    // Click magnifying glass button again to toggle hide
    fireEvent.click(searchBtn);
    expect(screen.queryByPlaceholderText('Tìm kiếm thuốc...')).toBeNull();
  });

  it('autofocuses the input field when it becomes visible', async () => {
    render(
      <MedicineUsageDialog
        open={true}
        onClose={mockOnClose}
        patientId={mockPatientId}
        patientName={mockPatientName}
      />
    );

    // Wait for data load
    await screen.findByRole('table');

    const searchBtn = screen.getByRole('button', { name: /toggle search/i });
    fireEvent.click(searchBtn);

    const input = screen.getByPlaceholderText('Tìm kiếm thuốc...');
    expect(input).toBe(document.activeElement);
  });

  it('filters the list of medicines with a 300ms debounce', async () => {
    render(
      <MedicineUsageDialog
        open={true}
        onClose={mockOnClose}
        patientId={mockPatientId}
        patientName={mockPatientName}
      />
    );

    // Wait for data load
    await screen.findByRole('table');

    // Enable fake timers after loading initial data
    vi.useFakeTimers();

    // Initially, both Panadol and Amoxicillin are visible
    expect(screen.getByText('Panadol')).toBeDefined();
    expect(screen.getByText('Amoxicillin')).toBeDefined();

    // Toggle search open
    const searchBtn = screen.getByRole('button', { name: /toggle search/i });
    fireEvent.click(searchBtn);

    const input = screen.getByPlaceholderText('Tìm kiếm thuốc...');
    fireEvent.change(input, { target: { value: 'Panadol' } });

    // Instantly check: search query is updated in input, but filtering shouldn't happen yet
    expect(screen.getByText('Panadol')).toBeDefined();
    expect(screen.getByText('Amoxicillin')).toBeDefined();

    // Fast-forward time by 299ms - still not filtered
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(screen.getByText('Panadol')).toBeDefined();
    expect(screen.getByText('Amoxicillin')).toBeDefined();

    // Fast-forward by 1ms (reaching 300ms) - filtered
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByText('Panadol')).toBeDefined();
    expect(screen.queryByText('Amoxicillin')).toBeNull();
  });

  it('filters by name and packing specification (Vietnamese & case-insensitive)', async () => {
    (getMedicineUsageByPatient as any).mockResolvedValue([
      { medicine_name: 'Thuốc ho bổ phế', packing_spec: 'Chai 100ml', times_prescribed: 3 },
      { medicine_name: 'Paracetamol', packing_spec: 'Vỉ 10 viên', times_prescribed: 1 },
      { medicine_name: 'Decolgen', packing_spec: 'Hộp 4 vỉ', times_prescribed: 2 },
    ]);

    render(
      <MedicineUsageDialog
        open={true}
        onClose={mockOnClose}
        patientId={mockPatientId}
        patientName={mockPatientName}
      />
    );

    await screen.findByRole('table');

    // Enable fake timers
    vi.useFakeTimers();

    // Toggle search
    const searchBtn = screen.getByRole('button', { name: /toggle search/i });
    fireEvent.click(searchBtn);
    const input = screen.getByPlaceholderText('Tìm kiếm thuốc...');

    // 1. Search for "thuoc ho" (unaccented lowercase) -> matches "Thuốc ho bổ phế"
    fireEvent.change(input, { target: { value: 'thuoc ho' } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText('Thuốc ho bổ phế')).toBeDefined();
    expect(screen.queryByText('Paracetamol')).toBeNull();
    expect(screen.queryByText('Decolgen')).toBeNull();

    // 2. Search for "VI" (case insensitive packing specification) -> matches "Paracetamol" (Vỉ 10 viên) and "Decolgen" (Hộp 4 vỉ)
    fireEvent.change(input, { target: { value: 'VI' } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText('Paracetamol')).toBeDefined();
    expect(screen.getByText('Decolgen')).toBeDefined();
    expect(screen.queryByText('Thuốc ho bổ phế')).toBeNull();

    // 3. Search for "bổ phế" (accented lowercase) -> matches "Thuốc ho bổ phế"
    fireEvent.change(input, { target: { value: 'bổ phế' } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText('Thuốc ho bổ phế')).toBeDefined();
    expect(screen.queryByText('Paracetamol')).toBeNull();
  });

  it('displays no results message when search yields no results', async () => {
    render(
      <MedicineUsageDialog
        open={true}
        onClose={mockOnClose}
        patientId={mockPatientId}
        patientName={mockPatientName}
      />
    );

    await screen.findByRole('table');

    // Enable fake timers
    vi.useFakeTimers();

    const searchBtn = screen.getByRole('button', { name: /toggle search/i });
    fireEvent.click(searchBtn);
    const input = screen.getByPlaceholderText('Tìm kiếm thuốc...');

    fireEvent.change(input, { target: { value: 'Nonexistent medicine' } });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.getByText('Không tìm thấy thuốc khớp với từ khóa')).toBeDefined();
  });

  it('resets search filter and restores the list on clear/close', async () => {
    render(
      <MedicineUsageDialog
        open={true}
        onClose={mockOnClose}
        patientId={mockPatientId}
        patientName={mockPatientName}
      />
    );

    await screen.findByRole('table');

    // Enable fake timers
    vi.useFakeTimers();

    const searchBtn = screen.getByRole('button', { name: /toggle search/i });
    fireEvent.click(searchBtn);
    const input = screen.getByPlaceholderText('Tìm kiếm thuốc...');

    // Type query to filter
    fireEvent.change(input, { target: { value: 'Panadol' } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText('Panadol')).toBeDefined();
    expect(screen.queryByText('Amoxicillin')).toBeNull();

    // Click clear button
    const clearBtn = screen.getByRole('button', { name: /clear search/i });
    fireEvent.click(clearBtn);
    
    // Check if it immediately restores the full list
    expect(screen.getByText('Panadol')).toBeDefined();
    expect(screen.getByText('Amoxicillin')).toBeDefined();

    // Filter again
    fireEvent.change(input, { target: { value: 'Panadol' } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByText('Amoxicillin')).toBeNull();

    // Close search by toggling it off
    fireEvent.click(searchBtn);
    expect(screen.getByText('Panadol')).toBeDefined();
    expect(screen.getByText('Amoxicillin')).toBeDefined();
  });
});
