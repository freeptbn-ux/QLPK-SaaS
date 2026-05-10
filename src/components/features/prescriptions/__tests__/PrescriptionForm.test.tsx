import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';
import PrescriptionForm from '../PrescriptionForm';
import { Patient } from '@/types/database';
import React from 'react';
import { createPrescription } from '@/actions/prescriptions';

// Mock useRouter
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
    back: vi.fn(),
  }),
}));

// Mock createPrescription
vi.mock('@/actions/prescriptions', () => ({
  createPrescription: vi.fn(),
}));

// Mock MedicineAutocomplete
vi.mock('../MedicineAutocomplete', () => ({
  default: ({ onSelect }: any) => (
    <div data-testid="medicine-autocomplete">
      <button 
        onClick={() => onSelect({ id: 1, name: 'Paracetamol', price: 1000, packing_spec: 'Viên' })}
        aria-label="add-medicine"
      >
        Add Medicine
      </button>
    </div>
  ),
}));

// Mock formatAge
vi.mock('@/lib/utils/age', () => ({
  formatAge: () => '34 tuổi',
}));

// Mock CountUp
vi.mock('@/components/ui/CountUp', () => ({
  default: ({ value }: { value: number }) => <span>{value.toLocaleString('vi-VN')} đ</span>,
}));

const mockPatient: Patient = {
  id: 1,
  name: 'Nguyễn Văn A',
  gender: 'Nam',
  dob: '1990-01-01',
  weight: '65',
  address: null,
  phone: null,
  medical_history: null,
  diagnosis: null,
  created_at: new Date().toISOString(),
  name_normalized: 'nguyen van a'
};

describe('PrescriptionForm', () => {
  test('renders PrescriptionForm with basic info', () => {
    render(<PrescriptionForm patient={mockPatient} consultationFee={50000} presets={[]} />);

    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.getByText('34 tuổi')).toBeInTheDocument();
    expect(screen.getByLabelText(/Cân nặng \(kg\)/)).toBeInTheDocument();
  });

  describe('Weight field', () => {
    test('renders weight input with label and mandatory asterisk', () => {
      render(<PrescriptionForm patient={mockPatient} consultationFee={50000} presets={[]} />);
      const label = screen.getByText(/Cân nặng \(kg\)/);
      expect(label).toBeInTheDocument();
      const asterisks = screen.getAllByText('*');
      expect(asterisks.length).toBeGreaterThanOrEqual(2); // Diagnosis and Weight
    });

    test('pre-fills weight from patient data', () => {
      render(<PrescriptionForm patient={mockPatient} consultationFee={50000} presets={[]} />);
      const input = screen.getByLabelText(/Cân nặng \(kg\)/) as HTMLInputElement;
      expect(input.value).toBe('65');
    });

    test('shows empty input when patient has no weight', () => {
      const patientNoWeight = { ...mockPatient, weight: null };
      render(<PrescriptionForm patient={patientNoWeight} consultationFee={50000} presets={[]} />);
      const input = screen.getByLabelText(/Cân nặng \(kg\)/) as HTMLInputElement;
      expect(input.value).toBe('');
    });

    test('shows error when submitting without weight', async () => {
      const patientNoWeight = { ...mockPatient, weight: null };
      render(<PrescriptionForm patient={patientNoWeight} consultationFee={50000} presets={[]} />);
      
      // Fill diagnosis
      fireEvent.change(screen.getByPlaceholderText(/Ví dụ: Viêm họng cấp/i), { target: { value: 'Sốt' } });
      
      // Add a medicine
      fireEvent.click(screen.getByLabelText('add-medicine'));

      // Submit
      fireEvent.click(screen.getByRole('button', { name: /lưu đơn thuốc/i }));

      expect(await screen.findByText('Vui lòng nhập cân nặng')).toBeInTheDocument();
    });

    test('shows error for invalid weight (zero)', async () => {
      render(<PrescriptionForm patient={mockPatient} consultationFee={50000} presets={[]} />);
      const input = screen.getByLabelText(/Cân nặng \(kg\)/);
      
      fireEvent.change(input, { target: { value: '0' } });
      fireEvent.blur(input);

      expect(await screen.findByText('Cân nặng phải lớn hơn 0')).toBeInTheDocument();
    });

    test('shows error for invalid weight (too large)', async () => {
      render(<PrescriptionForm patient={mockPatient} consultationFee={50000} presets={[]} />);
      const input = screen.getByLabelText(/Cân nặng \(kg\)/);
      
      fireEvent.change(input, { target: { value: '999' } });
      fireEvent.blur(input);

      expect(await screen.findByText('Cân nặng không hợp lệ')).toBeInTheDocument();
    });

    test('includes weight in form data on submit', async () => {
      vi.mocked(createPrescription).mockResolvedValue({ success: true } as any);
      
      render(<PrescriptionForm patient={mockPatient} consultationFee={50000} presets={[]} />);
      
      // Weight is already 65 from patient data
      
      // Fill diagnosis
      fireEvent.change(screen.getByPlaceholderText(/Ví dụ: Viêm họng cấp/i), { target: { value: 'Sốt' } });
      
      // Add a medicine
      fireEvent.click(screen.getByLabelText('add-medicine'));

      // Submit
      fireEvent.click(screen.getByRole('button', { name: /lưu đơn thuốc/i }));

      await waitFor(() => {
        expect(createPrescription).toHaveBeenCalledWith(expect.objectContaining({
          weight: '65'
        }));
      });
    });
  });
});
