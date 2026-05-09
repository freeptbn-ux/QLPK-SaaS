import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PrescriptionItemRow from '../PrescriptionItemRow';
import { PrescriptionItem } from '@/types/forms';

describe('PrescriptionItemRow Component', () => {
  const mockItem: PrescriptionItem = {
    medicine_id: 1,
    medicine_name: 'Paracetamol',
    packing_spec: 'Vỉ 10 viên',
    quantity: 2,
    unit_price: 5000,
  };

  const mockOnUpdate = vi.fn();
  const mockOnRemove = vi.fn();
  const mockOnMedicineClick = vi.fn();

  const renderRow = (item = mockItem) => {
    return render(
      <table>
        <tbody>
          <PrescriptionItemRow
            item={item}
            index={0}
            onUpdate={mockOnUpdate}
            onRemove={mockOnRemove}
            onMedicineClick={mockOnMedicineClick}
          />
        </tbody>
      </table>
    );
  };

  it('renders medicine name and packing spec', () => {
    renderRow();
    expect(screen.getByText('Paracetamol')).toBeInTheDocument();
    expect(screen.getByText('Vỉ 10 viên')).toBeInTheDocument();
  });

  it('has correct classes on quantity input for mobile optimization', () => {
    renderRow();
    const quantityInput = screen.getAllByRole('spinbutton')[0];
    
    // Check if spin buttons are hidden (Tailwind classes)
    expect(quantityInput.className).toContain('[appearance:textfield]');
    expect(quantityInput.className).toContain('[&::-webkit-outer-spin-button]:appearance-none');
    expect(quantityInput.className).toContain('[&::-webkit-inner-spin-button]:appearance-none');
    
    // Check padding classes
    expect(quantityInput.className).toContain('px-1');
    expect(quantityInput.className).toContain('sm:px-2');
  });

  it('has correct classes on parent td for quantity', () => {
    renderRow();
    const quantityInput = screen.getAllByRole('spinbutton')[0];
    const td = quantityInput.closest('td');
    
    expect(td).toHaveClass('px-2');
    expect(td).toHaveClass('min-w-[60px]');
    expect(td).toHaveClass('sm:min-w-[80px]');
    expect(td).toHaveClass('max-w-[80px]');
  });

  it('calls onUpdate when quantity changes', () => {
    renderRow();
    const quantityInput = screen.getAllByRole('spinbutton')[0];
    
    fireEvent.change(quantityInput, { target: { value: '5' } });
    
    expect(mockOnUpdate).toHaveBeenCalledWith(0, { quantity: 5 });
  });

  it('calls onRemove when delete button is clicked', () => {
    renderRow();
    const deleteButton = screen.getByTitle('Xóa thuốc');
    
    fireEvent.click(deleteButton);
    
    expect(mockOnRemove).toHaveBeenCalledWith(0);
  });

  it('displays calculated total correctly', () => {
    renderRow();
    // 2 * 5000 = 10000
    // The component uses Intl.NumberFormat('vi-VN').format(total)
    // In vi-VN, 10000 is usually formatted as "10.000"
    expect(screen.getByText(/10\.000/)).toBeInTheDocument();
  });
});
