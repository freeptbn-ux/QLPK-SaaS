import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MedicineFormDialog from '../src/components/features/medicines/MedicineFormDialog';
import { addMedicine, updateMedicine } from '../src/actions/medicines';

vi.mock('../src/actions/medicines', () => ({
  addMedicine: vi.fn(),
  updateMedicine: vi.fn(),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Phase 02: MedicineFormDialog UI Component Update', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Test 1: Render MedicineFormDialog and verify price <input> has step="any"', () => {
    const { container } = render(
      <MedicineFormDialog
        open={true}
        onClose={mockOnClose}
        medicine={null}
        onSuccess={mockOnSuccess}
      />
    );

    const priceInput = container.querySelector<HTMLInputElement>('input[name="price"]');
    expect(priceInput).not.toBeNull();
    expect(priceInput?.getAttribute('step')).toBe('any');
  });

  it('Test 2: Input 4.7 into price input and submit form successfully', async () => {
    (addMedicine as any).mockResolvedValueOnce({ id: 1 });

    const { container } = render(
      <MedicineFormDialog
        open={true}
        onClose={mockOnClose}
        medicine={null}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByPlaceholderText(/nhập tên thuốc/i);
    fireEvent.change(nameInput, { target: { value: 'Paracetamol 500mg' } });

    const priceInput = container.querySelector<HTMLInputElement>('input[name="price"]')!;
    fireEvent.change(priceInput, { target: { value: '4.7' } });

    const submitBtn = screen.getByRole('button', { name: /thêm mới/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(addMedicine).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Paracetamol 500mg',
          price: 4.7,
        })
      );
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('Test 3: Input 4,7 into price input and submit form successfully with price value 4.7', async () => {
    (addMedicine as any).mockResolvedValueOnce({ id: 2 });

    const { container } = render(
      <MedicineFormDialog
        open={true}
        onClose={mockOnClose}
        medicine={null}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByPlaceholderText(/nhập tên thuốc/i);
    fireEvent.change(nameInput, { target: { value: 'Amoxicillin 500mg' } });

    const priceInput = container.querySelector<HTMLInputElement>('input[name="price"]')!;
    fireEvent.change(priceInput, { target: { value: '4,7' } });

    const submitBtn = screen.getByRole('button', { name: /thêm mới/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(addMedicine).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Amoxicillin 500mg',
          price: 4.7,
        })
      );
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
