import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import PrescriptionForm from '../src/components/features/prescriptions/PrescriptionForm';
import { Patient } from '@/types/database';
import React from 'react';
import fs from 'fs';
import path from 'path';

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

// Setup custom MedicineAutocomplete mock that supports adding specific/multiple medicines
let medicineIndex = 0;
const testMedicines = [
  { id: 'm1', name: 'Paracetamol 500mg', price: 1000, packing_spec: 'Viên' },
  { id: 'm2', name: 'Amoxicillin 500mg', price: 2000, packing_spec: 'Viên' },
  { id: 'm3', name: 'Ibuprofen 400mg', price: 1500, packing_spec: 'Viên' },
  { id: 'm4', name: 'Decolgen Forte', price: 1200, packing_spec: 'Viên' },
  { id: 'm5', name: 'Cetirizine 10mg', price: 800, packing_spec: 'Viên' },
];

vi.mock('../src/components/features/prescriptions/MedicineAutocomplete', () => ({
  default: ({ onSelect }: any) => {
    const handleAdd = () => {
      if (medicineIndex < testMedicines.length) {
        onSelect(testMedicines[medicineIndex]);
        medicineIndex++;
      }
    };
    return (
      <div data-testid="medicine-autocomplete">
        <button onClick={handleAdd} aria-label="add-next-medicine">
          Add Next Medicine
        </button>
      </div>
    );
  },
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

describe('E2E Integration & Edge Cases: Copy prompt feature', () => {
  beforeEach(() => {
    medicineIndex = 0;
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  test('should correctly transition through adding 5 items, copying their details, and returning to disabled state upon removal', async () => {
    // Read reference prompt.txt content
    const promptTxtPath = path.resolve(__dirname, '../prompt.txt');
    const referencePrompt = JSON.parse(fs.readFileSync(promptTxtPath, 'utf-8'));

    const { container } = render(<PrescriptionForm patient={mockPatient} consultationFee={50000} presets={[]} />);
    const copyButton = screen.getByRole('button', { name: /Copy prompt/i });

    // Scenario 1: Initial empty state
    expect(copyButton).toBeDisabled();

    // Scenario 2: Add 1 medicine
    fireEvent.click(screen.getByLabelText('add-next-medicine'));
    expect(copyButton).not.toBeDisabled();

    // Verify clipboard content with 1 medicine
    fireEvent.click(copyButton);
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    let copiedText = vi.mocked(navigator.clipboard.writeText).mock.calls[0][0];
    let parsed = JSON.parse(copiedText);
    expect(parsed.input_format.name).toEqual({
      'name 1': 'Paracetamol 500mg'
    });

    // Reset mock
    vi.mocked(navigator.clipboard.writeText).mockClear();

    // Scenario 3: Add 4 more medicines to reach 5 total
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByLabelText('add-next-medicine'));
    }

    // Verify clipboard content with 5 medicines
    fireEvent.click(copyButton);
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    copiedText = vi.mocked(navigator.clipboard.writeText).mock.calls[0][0];
    parsed = JSON.parse(copiedText);

    expect(parsed.role).toBe(referencePrompt.role);
    expect(parsed.input_format.name).toEqual({
      'name 1': 'Paracetamol 500mg',
      'name 2': 'Amoxicillin 500mg',
      'name 3': 'Ibuprofen 400mg',
      'name 4': 'Decolgen Forte',
      'name 5': 'Cetirizine 10mg'
    });

    // Scenario 4: Remove items one by one and verify
    const removeButtons = screen.getAllByRole('button', { name: /remove-item/i });
    expect(removeButtons.length).toBe(5);

    // Remove 4 medicines
    for (let i = 0; i < 4; i++) {
      fireEvent.click(removeButtons[i]);
    }
    
    // Copy button should still be enabled (1 medicine left)
    expect(copyButton).not.toBeDisabled();

    // Remove the last medicine
    const lastRemoveButton = screen.getByRole('button', { name: /remove-item/i || /xóa/i });
    fireEvent.click(lastRemoveButton);

    // Should now be disabled
    expect(copyButton).toBeDisabled();
  });
});
