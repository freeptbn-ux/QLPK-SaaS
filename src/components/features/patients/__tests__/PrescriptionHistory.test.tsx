import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PrescriptionHistory from '../PrescriptionHistory';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import dayjs from 'dayjs';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock server actions
vi.mock('@/actions/prescriptions', () => ({
  appendToPrescription: vi.fn(),
  deletePrescription: vi.fn(),
  updatePrescription: vi.fn(),
}));

vi.mock('@/actions/medicines', () => ({
  getMedicineStockByIds: vi.fn(() => Promise.resolve([])),
}));

vi.mock('@/actions/patients', () => ({
  getPatientPrescriptionsPaginated: vi.fn(),
  getMedicineUsageByPatient: vi.fn(),
}));

// Mock components
vi.mock('../../prescriptions/MedicineAutocomplete', () => ({
  default: ({ onSelect }: { onSelect: (m: any) => void }) => (
    <div data-testid="medicine-autocomplete">
      <button onClick={() => onSelect({ id: 202, name: 'Medicine B', price: 10000, packing_spec: 'Pill' })}>
        Select Medicine B
      </button>
    </div>
  ),
}));

vi.mock('../MedicineUsageDialog', () => ({
  default: () => <div data-testid="medicine-usage-dialog" />,
}));

const mockPrescriptions = [
  {
    id: 1,
    patient_id: 1,
    prescription_date: dayjs().toISOString(),
    diagnosis: 'Test Diagnosis',
    notes: 'Test Notes',
    total_amount: 100000,
    consultation_fee: 50000,
    prescription_details: [
      {
        id: 1,
        medicine_id: 101,
        quantity: 10,
        unit_price: 5000,
        medicines: {
          name: 'Medicine A',
          packing_spec: 'Box',
          price: 5000,
        }
      }
    ]
  }
];

describe('PrescriptionHistory Quantity UX', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow quantity to be cleared (0) and show error on submit', async () => {
    render(
      <PrescriptionHistory
        patientId={1}
        patientName="Test Patient"
        prescriptions={mockPrescriptions as any}
      />
    );

    // Expand the prescription
    fireEvent.click(screen.getByText('Test Diagnosis'));

    // Open Edit Dialog
    fireEvent.click(screen.getByText('Sửa đơn'));

    // Find quantity input
    const quantityInput = screen.getByDisplayValue('10') as HTMLInputElement;

    // Clear quantity
    fireEvent.change(quantityInput, { target: { value: '' } });
    expect(quantityInput.value).toBe('');

    // Try to save
    const saveButton = screen.getByText('Lưu thay đổi');
    fireEvent.click(saveButton);

    // Should show error message
    expect(await screen.findByText('Số lượng thuốc phải lớn hơn 0')).toBeInTheDocument();
  });

  it('should allow updating quantity to a new value', async () => {
    render(
      <PrescriptionHistory
        patientId={1}
        patientName="Test Patient"
        prescriptions={mockPrescriptions as any}
      />
    );

    fireEvent.click(screen.getByText('Test Diagnosis'));
    fireEvent.click(screen.getByText('Sửa đơn'));

    const quantityInput = screen.getByDisplayValue('10') as HTMLInputElement;

    // Change to 5
    fireEvent.change(quantityInput, { target: { value: '5' } });
    expect(quantityInput.value).toBe('5');
  });

  it('should validate quantity in Append Dialog', async () => {
    // Mock window.alert
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <PrescriptionHistory
        patientId={1}
        patientName="Test Patient"
        prescriptions={mockPrescriptions as any}
      />
    );

    fireEvent.click(screen.getByText('Test Diagnosis'));
    
    // Open Append Dialog
    fireEvent.click(screen.getByText('Thêm thuốc'));

    // Select a medicine
    fireEvent.click(screen.getByText('Select Medicine B'));

    // Find quantity input for Medicine B
    const quantityInput = screen.getByDisplayValue('1') as HTMLInputElement;

    // Clear quantity
    fireEvent.change(quantityInput, { target: { value: '' } });
    expect(quantityInput.value).toBe('');

    // Try to save
    const saveButton = screen.getByText('Lưu thêm');
    fireEvent.click(saveButton);

    // Should show alert
    expect(alertMock).toHaveBeenCalledWith('Số lượng thuốc phải lớn hơn 0');
  });
});
