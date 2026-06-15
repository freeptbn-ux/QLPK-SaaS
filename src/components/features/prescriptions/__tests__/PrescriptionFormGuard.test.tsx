import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import PrescriptionForm from '../PrescriptionForm';
import { Patient } from '@/types/database';
import React from 'react';
import { createPrescription } from '@/actions/prescriptions';

// Mock useRouter
const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
    back: mockBack,
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

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
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

describe('PrescriptionForm Navigation Guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  test('does not show confirm modal when form is clean and back button clicked', () => {
    render(<PrescriptionForm patient={mockPatient} consultationFee={50000} presets={[]} />);
    
    const backBtn = screen.getByRole('button', { name: /quay lại/i });
    fireEvent.click(backBtn);

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Thay đổi chưa được lưu')).not.toBeInTheDocument();
  });

  test('shows custom confirm modal when form is dirty and back button clicked', async () => {
    render(<PrescriptionForm patient={mockPatient} consultationFee={50000} presets={[]} />);

    // Make the form dirty by typing in diagnosis
    const diagnosisInput = screen.getByPlaceholderText(/Ví dụ: Viêm họng cấp/i);
    fireEvent.change(diagnosisInput, { target: { value: 'Viêm họng' } });

    // Click back button
    const backBtn = screen.getByRole('button', { name: /quay lại/i });
    fireEvent.click(backBtn);

    // Verify modal is open
    expect(screen.getByText('Thay đổi chưa được lưu')).toBeInTheDocument();

    // Verify presence and styles of three buttons
    const cancelBtn = screen.getByRole('button', { name: 'Hủy' });
    const discardBtn = screen.getByRole('button', { name: 'Không lưu đơn' });
    const saveBtn = screen.getByRole('button', { name: 'Lưu đơn' });

    expect(cancelBtn).toHaveClass('border-slate-200');
    expect(discardBtn).toHaveClass('bg-red-600');
    expect(saveBtn).toHaveClass('bg-emerald-600');
  });

  test('closes dialog and stays on page when "Hủy" is clicked', async () => {
    render(<PrescriptionForm patient={mockPatient} consultationFee={50000} presets={[]} />);

    // Make dirty
    const diagnosisInput = screen.getByPlaceholderText(/Ví dụ: Viêm họng cấp/i);
    fireEvent.change(diagnosisInput, { target: { value: 'Viêm họng' } });

    // Click back button
    const backBtn = screen.getByRole('button', { name: /quay lại/i });
    fireEvent.click(backBtn);

    // Click "Hủy"
    const cancelBtn = screen.getByRole('button', { name: 'Hủy' });
    fireEvent.click(cancelBtn);

    // Verify modal closed
    expect(screen.queryByText('Thay đổi chưa được lưu')).not.toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockBack).not.toHaveBeenCalled();
  });

  test('navigates to target URL without saving when "Không lưu đơn" is clicked', async () => {
    render(<PrescriptionForm patient={mockPatient} consultationFee={50000} presets={[]} />);

    // Make dirty
    const diagnosisInput = screen.getByPlaceholderText(/Ví dụ: Viêm họng cấp/i);
    fireEvent.change(diagnosisInput, { target: { value: 'Viêm họng' } });

    // Click back button
    const backBtn = screen.getByRole('button', { name: /quay lại/i });
    fireEvent.click(backBtn);

    // Click "Không lưu đơn"
    const discardBtn = screen.getByRole('button', { name: 'Không lưu đơn' });
    fireEvent.click(discardBtn);

    // Verify modal closes and push is called with patient detail page
    expect(screen.queryByText('Thay đổi chưa được lưu')).not.toBeInTheDocument();
    expect(mockPush).toHaveBeenCalledWith('/patients/1');
    expect(createPrescription).not.toHaveBeenCalled();
  });

  test('submits prescription and navigates to target URL when "Lưu đơn" is clicked with valid data', async () => {
    vi.mocked(createPrescription).mockResolvedValue({ success: true } as any);

    render(<PrescriptionForm patient={mockPatient} consultationFee={50000} presets={[]} />);

    // Make dirty
    const diagnosisInput = screen.getByPlaceholderText(/Ví dụ: Viêm họng cấp/i);
    fireEvent.change(diagnosisInput, { target: { value: 'Viêm họng' } });

    // Add a medicine
    fireEvent.click(screen.getByLabelText('add-medicine'));

    // Click back button
    const backBtn = screen.getByRole('button', { name: /quay lại/i });
    fireEvent.click(backBtn);

    // Click "Lưu đơn"
    const saveBtn = screen.getByRole('button', { name: 'Lưu đơn' });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(createPrescription).toHaveBeenCalledWith(expect.objectContaining({
        diagnosis: 'Viêm họng',
        weight: '65',
      }));
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/patients/1');
    });
  });

  test('keeps user on page and displays validation errors when "Lưu đơn" is clicked with invalid data', async () => {
    render(<PrescriptionForm patient={mockPatient} consultationFee={50000} presets={[]} />);

    // Make dirty with notes, but empty diagnosis and items
    const notesInput = screen.getByPlaceholderText(/Ghi chú về cách dùng/i);
    fireEvent.change(notesInput, { target: { value: 'Uống sau ăn' } });

    // Click back button
    const backBtn = screen.getByRole('button', { name: /quay lại/i });
    fireEvent.click(backBtn);

    // Click "Lưu đơn"
    const saveBtn = screen.getByRole('button', { name: 'Lưu đơn' });
    fireEvent.click(saveBtn);

    // Should show error because diagnosis is empty
    expect(await screen.findByText('Vui lòng nhập chẩn đoán')).toBeInTheDocument();
    expect(createPrescription).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('intercepts anchor click when form is dirty', async () => {
    render(<PrescriptionForm patient={mockPatient} consultationFee={50000} presets={[]} />);

    // Make dirty
    const diagnosisInput = screen.getByPlaceholderText(/Ví dụ: Viêm họng cấp/i);
    fireEvent.change(diagnosisInput, { target: { value: 'Viêm họng' } });

    // Setup dummy anchor tag
    const link = document.createElement('a');
    link.setAttribute('href', '/patients/2');
    document.body.appendChild(link);

    // Click link
    fireEvent.click(link);

    // Verify modal is shown
    expect(screen.getByText('Thay đổi chưa được lưu')).toBeInTheDocument();

    // Click "Không lưu đơn"
    const discardBtn = screen.getByRole('button', { name: 'Không lưu đơn' });
    fireEvent.click(discardBtn);

    expect(mockPush).toHaveBeenCalledWith('/patients/2');
    
    // Clean up
    document.body.removeChild(link);
  });
});
