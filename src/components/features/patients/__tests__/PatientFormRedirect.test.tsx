import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PatientFormDialog from '../PatientFormDialog';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addPatient } from '@/actions/patients';

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock toast hook
vi.mock('@/hooks/useToast', () => ({
  useToast: vi.fn(() => ({ showToast: vi.fn() })),
}));

// Mock action
vi.mock('@/actions/patients', () => ({
  addPatient: vi.fn(),
  updatePatient: vi.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('PatientFormDialog Redirection', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to /patients/[id] on successful creation', async () => {
    // Setup mock return value for addPatient
    const mockCreatedPatient = { id: 123, name: 'Nguyễn Văn A' };
    vi.mocked(addPatient).mockResolvedValue({
      data: mockCreatedPatient as any,
      isExisting: false,
    });

    render(
      <PatientFormDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Fill the name field
    const nameInput = screen.getByLabelText(/Họ và tên/);
    fireEvent.change(nameInput, { target: { value: 'Nguyễn Văn A' } });

    // Fill DOB
    const dayInput = screen.getByPlaceholderText('DD');
    const monthInput = screen.getByPlaceholderText('MM');
    const yearInput = screen.getByPlaceholderText('YYYY');
    fireEvent.change(dayInput, { target: { value: '15' } });
    fireEvent.change(monthInput, { target: { value: '06' } });
    fireEvent.change(yearInput, { target: { value: '1990' } });

    // Fill phone number
    const phoneInput = screen.getByLabelText(/Số điện thoại/);
    fireEvent.change(phoneInput, { target: { value: '0123456789' } });

    // Submit form
    const saveButton = screen.getByText('Lưu');
    fireEvent.click(saveButton);

    // Wait for submission and redirection assertions
    await waitFor(() => {
      expect(addPatient).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/patients/123');
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
