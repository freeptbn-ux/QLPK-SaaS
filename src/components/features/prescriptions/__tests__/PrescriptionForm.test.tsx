import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import PrescriptionForm from '../PrescriptionForm';
import { Patient } from '@/types/database';
import React from 'react';

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock createPrescription
vi.mock('@/actions/prescriptions', () => ({
  createPrescription: vi.fn(),
}));

// Mock MedicineAutocomplete
vi.mock('../MedicineAutocomplete', () => ({
  default: () => <div data-testid="medicine-autocomplete" />,
}));

// Mock formatAge
vi.mock('@/lib/utils/age', () => ({
  formatAge: (dob: string) => '34 tuổi',
}));

const mockPatient: Patient = {
  id: '1',
  name: 'Nguyễn Văn A',
  gender: 'Nam',
  dob: '1990-01-01',
  weight: 65,
} as any;

test('renders PrescriptionForm with hidden fee details and enhanced UI', () => {
  render(<PrescriptionForm patient={mockPatient} consultationFee={50000} />);

  // Check if patient info is rendered
  expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
  expect(screen.getByText('Cân nặng: 65 kg')).toBeInTheDocument();

  // Check if "Thanh toán" is rendered
  expect(screen.getByText('Thanh toán')).toBeInTheDocument();

  // Check if "Tiền thuốc" and "Phí khám" are NOT visible (commented out)
  expect(screen.queryByText('Tiền thuốc:')).not.toBeInTheDocument();
  expect(screen.queryByText('Phí khám:')).not.toBeInTheDocument();

  // Check if "Tổng cộng" is rendered
  expect(screen.getByText('Tổng cộng:')).toBeInTheDocument();

  // Check if button "Lưu đơn thuốc" is rendered
  const saveButton = screen.getByRole('button', { name: /lưu đơn thuốc/i });
  expect(saveButton).toBeInTheDocument();
  
  // Verify button has large size (MUI button-large class)
  expect(saveButton).toHaveClass('MuiButton-sizeLarge');
});
