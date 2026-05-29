import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import StockAdjustDialog from '../components/features/medicines/StockAdjustDialog';
import { updateMedicineStock } from '@/actions/medicines';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock medicine action
vi.mock('@/actions/medicines', () => ({
  updateMedicineStock: vi.fn(),
}));

describe('StockAdjustDialog', () => {
  const mockMedicine = {
    id: 1,
    name: 'Paracetamol',
    stock_quantity: 100,
    price: 1000,
    min_stock_level: 10,
  };

  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly when open', () => {
    render(
      <StockAdjustDialog
        open={true}
        onClose={mockOnClose}
        medicine={mockMedicine as any}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText(/điều chỉnh tồn kho/i)).toBeDefined();
    expect(screen.getByText(/Paracetamol/)).toBeDefined();
    expect(screen.getAllByText(/100/)).toBeDefined();
  });

  it('should call updateMedicineStock with adjustment and reason', async () => {
    (updateMedicineStock as any).mockResolvedValue({ success: true });

    render(
      <StockAdjustDialog
        open={true}
        onClose={mockOnClose}
        medicine={mockMedicine as any}
        onSuccess={mockOnSuccess}
      />
    );

    const adjustmentInput = screen.getByRole('spinbutton');
    const reasonInput = screen.getByPlaceholderText(/VD: Nhập thêm hàng/i);
    const updateButton = screen.getByText(/cập nhật/i);

    fireEvent.change(adjustmentInput, { target: { value: '10' } });
    fireEvent.change(reasonInput, { target: { value: 'Nhập hàng mới' } });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(updateMedicineStock).toHaveBeenCalledWith(1, 10, 'Nhập hàng mới');
    });

    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show error if adjustment is 0', async () => {
    render(
      <StockAdjustDialog
        open={true}
        onClose={mockOnClose}
        medicine={mockMedicine as any}
        onSuccess={mockOnSuccess}
      />
    );

    const updateButton = screen.getByText(/cập nhật/i);
    fireEvent.click(updateButton);

    expect(screen.getByText(/vui lòng nhập số lượng thay đổi/i)).toBeDefined();
    expect(updateMedicineStock).not.toHaveBeenCalled();
  });

  it('should show error if reason is empty', async () => {
    render(
      <StockAdjustDialog
        open={true}
        onClose={mockOnClose}
        medicine={mockMedicine as any}
        onSuccess={mockOnSuccess}
      />
    );

    const adjustmentInput = screen.getByRole('spinbutton');
    const updateButton = screen.getByText(/cập nhật/i);

    fireEvent.change(adjustmentInput, { target: { value: '10' } });
    fireEvent.click(updateButton);

    expect(screen.getByText(/vui lòng nhập lý do điều chỉnh/i)).toBeDefined();
    expect(updateMedicineStock).not.toHaveBeenCalled();
  });

  it('should display error message from server', async () => {
    (updateMedicineStock as any).mockRejectedValue(new Error('Số lượng kho không đủ'));

    render(
      <StockAdjustDialog
        open={true}
        onClose={mockOnClose}
        medicine={mockMedicine as any}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '-200' } });
    fireEvent.change(screen.getByPlaceholderText(/VD: Nhập thêm hàng/i), { target: { value: 'Xuất kho' } });
    fireEvent.click(screen.getByText(/cập nhật/i));

    await waitFor(() => {
      expect(screen.getByText(/số lượng kho không đủ/i)).toBeDefined();
    });
  });
});
