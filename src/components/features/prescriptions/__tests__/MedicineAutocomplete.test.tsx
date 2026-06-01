import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MedicineAutocomplete from '../MedicineAutocomplete';
import { getMedicinesForSearch } from '@/actions/medicines';

vi.mock('@/actions/medicines', () => ({
  getMedicinesForSearch: vi.fn(),
}));

const mockShowToast = vi.fn();
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

describe('MedicineAutocomplete Client-Side Search', () => {
  const mockOnSelect = vi.fn();

  const mockMedicines = [
    {
      id: 1,
      name: 'In Stock Medicine',
      packing_spec: 'Box',
      price: 10000,
      stock_quantity: 10,
      min_stock_level: 5,
    },
    {
      id: 2,
      name: 'Out of Stock Medicine',
      packing_spec: 'Bottle',
      price: 20000,
      stock_quantity: 0,
      min_stock_level: 5,
    },
    {
      id: 3,
      name: 'Paracetamol Đỏ',
      packing_spec: 'Box',
      price: 15000,
      stock_quantity: 50,
      min_stock_level: 10,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (getMedicinesForSearch as any).mockResolvedValue(mockMedicines);
  });

  it('loads medicines once on mount and filters instantly on input changes without extra network requests', async () => {
    render(<MedicineAutocomplete onSelect={mockOnSelect} />);

    // getMedicinesForSearch should be called exactly once
    expect(getMedicinesForSearch).toHaveBeenCalledTimes(1);

    const input = screen.getByPlaceholderText(/Nhập tên thuốc/i);
    
    // Type "In Stock"
    fireEvent.change(input, { target: { value: 'In Stock' } });
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('In Stock Medicine')).toBeInTheDocument();
    });
    expect(screen.queryByText('Out of Stock Medicine')).not.toBeInTheDocument();

    // Type "Out of Stock"
    fireEvent.change(input, { target: { value: 'Out of Stock' } });
    await waitFor(() => {
      expect(screen.getByText('Out of Stock Medicine')).toBeInTheDocument();
    });
    expect(screen.queryByText('In Stock Medicine')).not.toBeInTheDocument();

    // getMedicinesForSearch should still have been called exactly once
    expect(getMedicinesForSearch).toHaveBeenCalledTimes(1);
  });

  it('supports Vietnamese diacritic-insensitive search', async () => {
    render(<MedicineAutocomplete onSelect={mockOnSelect} />);

    const input = screen.getByPlaceholderText(/Nhập tên thuốc/i);
    
    // Type "para"
    fireEvent.change(input, { target: { value: 'para' } });
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('Paracetamol Đỏ')).toBeInTheDocument();
    });

    // Type "do" (no accent) - should match "Đỏ"
    fireEvent.change(input, { target: { value: 'do' } });
    await waitFor(() => {
      expect(screen.getByText('Paracetamol Đỏ')).toBeInTheDocument();
    });

    // Type "đỏ" (with accents/capitalized or not)
    fireEvent.change(input, { target: { value: 'đỏ' } });
    await waitFor(() => {
      expect(screen.getByText('Paracetamol Đỏ')).toBeInTheDocument();
    });
  });

  it('highlights out of stock medicine in red and shows badge', async () => {
    render(<MedicineAutocomplete onSelect={mockOnSelect} />);

    const input = screen.getByPlaceholderText(/Nhập tên thuốc/i);
    fireEvent.change(input, { target: { value: 'Medicine' } });
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('In Stock Medicine')).toBeInTheDocument();
    });

    const outOfStockName = screen.getByText('Out of Stock Medicine');
    expect(outOfStockName).toBeInTheDocument();
    
    // Check for red color class
    expect(outOfStockName.className).toContain('text-red-600');

    // Check for "Hết hàng" badge
    expect(screen.getByText('Hết hàng')).toBeInTheDocument();

    // Check for stock quantity color
    const outOfStockQty = screen.getByText(/Tồn: 0/);
    expect(outOfStockQty.className).toContain('text-red-600');
    expect(outOfStockQty.className).toContain('font-bold');
    
    // Check for cursor-not-allowed
    const button = outOfStockName.closest('button');
    expect(button?.className).toContain('cursor-not-allowed');
  });

  it('displays normal medicine with primary/gray colors', async () => {
    render(<MedicineAutocomplete onSelect={mockOnSelect} />);

    const input = screen.getByPlaceholderText(/Nhập tên thuốc/i);
    fireEvent.change(input, { target: { value: 'Medicine' } });
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('In Stock Medicine')).toBeInTheDocument();
    });

    const inStockName = screen.getByText('In Stock Medicine');
    // First item is selected by default in search results
    expect(inStockName.className).toContain('text-primary-700');
    
    const inStockQty = screen.getByText(/Tồn: 10/);
    expect(inStockQty.className).toContain('text-gray-500');
    
    const button = inStockName.closest('button');
    expect(button?.className).not.toContain('cursor-not-allowed');
  });

  it('prevents selection of out of stock medicine via click', async () => {
    render(<MedicineAutocomplete onSelect={mockOnSelect} />);

    const input = screen.getByPlaceholderText(/Nhập tên thuốc/i);
    fireEvent.change(input, { target: { value: 'Medicine' } });
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('Out of Stock Medicine')).toBeInTheDocument();
    });

    const outOfStockButton = screen.getByText('Out of Stock Medicine').closest('button')!;
    expect(outOfStockButton).not.toBeDisabled();
    expect(outOfStockButton.className).toContain('cursor-not-allowed');

    fireEvent.click(outOfStockButton);
    expect(mockOnSelect).not.toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith(expect.any(String), 'error');
  });

  it('prevents selection of out of stock medicine via Enter key', async () => {
    render(<MedicineAutocomplete onSelect={mockOnSelect} />);

    const input = screen.getByPlaceholderText(/Nhập tên thuốc/i);
    fireEvent.change(input, { target: { value: 'Medicine' } });
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('Out of Stock Medicine')).toBeInTheDocument();
    });

    // Move down to index 1 (Out of Stock)
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    
    // Press Enter
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(mockOnSelect).not.toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith(expect.any(String), 'error');
    
    // Move back to index 0 and select it
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockMedicines[0]);
  });
});
