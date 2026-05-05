import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MedicineUsageDialog from '../MedicineUsageDialog';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMedicineUsageByPatient } from '@/actions/patients';

// Mock dependencies
vi.mock('@/actions/patients', () => ({
  getMedicineUsageByPatient: vi.fn(),
}));

vi.mock('framer-motion', () => ({
  motion: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Loading component
vi.mock('@/components/Loading', () => ({
  BallLoader: () => <div>Loading...</div>,
}));

const mockData = [
  { medicine_name: 'Paracetamol', packing_spec: 'Vỉ 10 viên', times_prescribed: 5 },
  { medicine_name: 'Amoxicillin', packing_spec: 'Hộp 20 viên', times_prescribed: 2 },
  { medicine_name: 'Vitamin C', packing_spec: 'Lọ 100 viên', times_prescribed: 10 },
];

describe('MedicineUsageDialog Sorting', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (getMedicineUsageByPatient as any).mockResolvedValue(mockData);
  });

  it('should sort by medicine name (A-Z -> Z-A -> None)', async () => {
    render(
      <MedicineUsageDialog
        open={true}
        onClose={mockOnClose}
        patientId={1}
        patientName="Nguyen Van A"
      />
    );

    await waitFor(() => expect(screen.getByText('Paracetamol')).toBeInTheDocument());

    const nameHeader = screen.getByText('Tên thuốc');

    // Click 1: A-Z
    fireEvent.click(nameHeader);
    let rows = screen.getAllByRole('row').slice(1); // skip header
    expect(rows[0]).toHaveTextContent('Amoxicillin');
    expect(rows[1]).toHaveTextContent('Paracetamol');
    expect(rows[2]).toHaveTextContent('Vitamin C');

    // Click 2: Z-A
    fireEvent.click(nameHeader);
    rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Vitamin C');
    expect(rows[1]).toHaveTextContent('Paracetamol');
    expect(rows[2]).toHaveTextContent('Amoxicillin');

    // Click 3: None (Back to original order from mock)
    fireEvent.click(nameHeader);
    rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Paracetamol');
    expect(rows[1]).toHaveTextContent('Amoxicillin');
    expect(rows[2]).toHaveTextContent('Vitamin C');
  });

  it('should sort by times prescribed (High-Low -> Low-High -> None)', async () => {
    render(
      <MedicineUsageDialog
        open={true}
        onClose={mockOnClose}
        patientId={1}
        patientName="Nguyen Van A"
      />
    );

    await waitFor(() => expect(screen.getByText('Paracetamol')).toBeInTheDocument());

    const countHeader = screen.getByText('Số lần');

    // Click 1: High to Low (Desc)
    fireEvent.click(countHeader);
    let rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Vitamin C'); // 10
    expect(rows[1]).toHaveTextContent('Paracetamol'); // 5
    expect(rows[2]).toHaveTextContent('Amoxicillin'); // 2

    // Click 2: Low to High (Asc)
    fireEvent.click(countHeader);
    rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Amoxicillin'); // 2
    expect(rows[1]).toHaveTextContent('Paracetamol'); // 5
    expect(rows[2]).toHaveTextContent('Vitamin C'); // 10

    // Click 3: None
    fireEvent.click(countHeader);
    rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Paracetamol');
    expect(rows[1]).toHaveTextContent('Amoxicillin');
    expect(rows[2]).toHaveTextContent('Vitamin C');
  });
});
