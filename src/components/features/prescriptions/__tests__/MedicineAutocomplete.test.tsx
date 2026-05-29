import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MedicineAutocomplete from '../MedicineAutocomplete';
import { getMedicines } from '@/actions/medicines';

vi.mock('@/actions/medicines', () => ({
  getMedicines: vi.fn(),
}));

const mockShowToast = vi.fn();
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

describe('MedicineAutocomplete UI Enhancement', () => {
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
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (getMedicines as any).mockResolvedValue(mockMedicines);
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
    
    // Check for red color class (Tailwind text-red-600)
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
    expect(outOfStockButton).not.toBeDisabled(); // We removed disabled to show toast
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

    // "In Stock Medicine" is id 1, index 0. "Out of Stock Medicine" is id 2, index 1.
    // Initial selectedIndex is 0 (In Stock).
    
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
