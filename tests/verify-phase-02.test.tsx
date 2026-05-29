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

// Mock MedicineAutocomplete
vi.mock('../src/components/features/prescriptions/MedicineAutocomplete', () => ({
  default: ({ onSelect }: any) => (
    <div data-testid="medicine-autocomplete">
      <button 
        onClick={() => onSelect({ id: 'med-1', name: 'Paracetamol 500mg', price: 1000, packing_spec: 'Viên' })}
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

describe('Phase 2: Copy prompt button functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  test('renders "Copy prompt" button initially and disabled', () => {
    render(<PrescriptionForm patient={mockPatient} consultationFee={50000} presets={[]} />);
    const copyButton = screen.getByRole('button', { name: /Copy prompt/i });
    expect(copyButton).toBeInTheDocument();
    expect(copyButton).toBeDisabled();
  });

  test('enables "Copy prompt" button after adding medicine', async () => {
    render(<PrescriptionForm patient={mockPatient} consultationFee={50000} presets={[]} />);
    const copyButton = screen.getByRole('button', { name: /Copy prompt/i });
    expect(copyButton).toBeDisabled();

    // Add a medicine
    fireEvent.click(screen.getByLabelText('add-medicine'));

    expect(copyButton).not.toBeDisabled();
  });

  test('copies correct dynamic prompt JSON matching prompt.txt when clicked', async () => {
    // Read the reference prompt.txt content
    const promptTxtPath = path.resolve(__dirname, '../prompt.txt');
    const referencePrompt = JSON.parse(fs.readFileSync(promptTxtPath, 'utf-8'));

    render(<PrescriptionForm patient={mockPatient} consultationFee={50000} presets={[]} />);
    const copyButton = screen.getByRole('button', { name: /Copy prompt/i });

    // Add a medicine
    fireEvent.click(screen.getByLabelText('add-medicine'));

    // Click Copy prompt button
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    
    // Parse the copied JSON
    const copiedText = vi.mocked(navigator.clipboard.writeText).mock.calls[0][0];
    const parsedJSON = JSON.parse(copiedText);

    // Verify structural components match referencePrompt
    expect(parsedJSON.role).toBe(referencePrompt.role);
    expect(parsedJSON.objective).toBe(referencePrompt.objective);
    expect(parsedJSON.input_format.description).toBe(referencePrompt.input_format.description);
    
    // Verify dynamic substitution in names
    expect(parsedJSON.input_format.name).toEqual({
      'name 1': 'Paracetamol 500mg'
    });
    
    // Verify rest of arrays match
    expect(parsedJSON.rules).toEqual(referencePrompt.rules);
    expect(parsedJSON.output_requirements).toEqual(referencePrompt.output_requirements);
    expect(parsedJSON.table_columns).toEqual(referencePrompt.table_columns);
  });
});
