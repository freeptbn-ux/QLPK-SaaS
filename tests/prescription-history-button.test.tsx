import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import PrescriptionForm from '@/components/features/prescriptions/PrescriptionForm';
import { Patient } from '@/types/database';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock MedicineUsageDialog to assert props and open state
vi.mock('@/components/features/patients/MedicineUsageDialog', () => ({
  default: vi.fn(({ open, onClose, patientId, patientName }) => {
    if (!open) return null;
    return (
      <div data-testid="mock-medicine-usage-dialog">
        <span>Patient ID: {patientId}</span>
        <span>Patient Name: {patientName}</span>
        <button type="button" onClick={onClose} data-testid="close-history-dialog">
          Close Dialog
        </button>
      </div>
    );
  }),
}));

// Mock actions and helpers
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/actions/prescriptions', () => ({
  createPrescription: vi.fn(),
}));

vi.mock('@/actions/medicines', () => ({
  getMedicinesForSearch: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/actions/patients', () => ({
  getMedicineUsageByPatient: vi.fn().mockResolvedValue([]),
}));

const mockPatient: Patient = {
  id: 42,
  name: 'Nguyen Van A',
  dob: '1990-01-01',
  gender: 'male',
  phone: '0901234567',
  address: '123 Test Street',
  weight: 65,
  clinic_id: 1,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
} as unknown as Patient;

describe('Phase 02 Test: Prescription Form History Modal Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "Lịch sử dùng thuốc" button and toggles the dialog without altering form state', async () => {
    await act(async () => {
      render(
        <PrescriptionForm
          patient={mockPatient}
          consultationFee={50000}
          presets={[]}
        />
      );
    });

    // Verify history trigger button is present
    const historyButton = screen.getByRole('button', { name: /lịch sử dùng thuốc/i });
    expect(historyButton).toBeDefined();

    // Dialog should initially be closed
    expect(screen.queryByTestId('mock-medicine-usage-dialog')).toBeNull();

    // Enter a diagnosis into the form
    const diagnosisInput = screen.getByPlaceholderText(/nhập chẩn đoán/i) as HTMLInputElement;
    fireEvent.change(diagnosisInput, { target: { value: 'Viêm họng cấp' } });
    expect(diagnosisInput.value).toBe('Viêm họng cấp');

    // Click history button to open dialog
    fireEvent.click(historyButton);

    // Verify dialog opened with matching patient props
    const dialog = screen.getByTestId('mock-medicine-usage-dialog');
    expect(dialog).toBeDefined();
    expect(screen.getByText('Patient ID: 42')).toBeDefined();
    expect(screen.getByText('Patient Name: Nguyen Van A')).toBeDefined();

    // Close dialog
    const closeBtn = screen.getByTestId('close-history-dialog');
    fireEvent.click(closeBtn);

    // Dialog closed, diagnosis input retains its value
    expect(screen.queryByTestId('mock-medicine-usage-dialog')).toBeNull();
    expect(diagnosisInput.value).toBe('Viêm họng cấp');
  });
});
