import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';

// Mocks
const mockCreatePrescription = vi.fn();
const mockAppendToPrescription = vi.fn();
const mockUpdateMedicineStock = vi.fn();
const mockInvalidateCatalog = vi.fn();

const sampleCatalog = [
  { id: 101, name: 'Paracetamol 500mg vỉ xanh', unit: 'Vỉ', price: 12000, stock_quantity: 50, min_stock_level: 5, is_active: true },
  { id: 102, name: 'Astemix siro', unit: 'Chai', price: 30000, stock_quantity: 20, min_stock_level: 2, is_active: true },
];

vi.mock('@/hooks/useMedicineCatalog', () => ({
  useMedicineCatalog: () => ({
    medicines: sampleCatalog,
    isLoading: false,
    error: null,
  }),
  invalidateMedicineCatalog: () => mockInvalidateCatalog(),
}));

vi.mock('@/actions/prescriptions', () => ({
  createPrescription: (...args: any[]) => mockCreatePrescription(...args),
  appendToPrescription: (...args: any[]) => mockAppendToPrescription(...args),
  deletePrescription: vi.fn(),
  updatePrescription: vi.fn(),
}));

vi.mock('@/actions/medicines', () => ({
  updateMedicineStock: (...args: any[]) => mockUpdateMedicineStock(...args),
  getMedicineStockByIds: vi.fn(() => Promise.resolve([])),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe('Phase 03: Prescription Integration, Stock Revalidation & Cache Invalidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('Requirement: should select medicine from autocomplete and auto-populate prescription item', async () => {
    const { default: PrescriptionForm } = await import('@/components/features/prescriptions/PrescriptionForm');
    const patient = { id: 96, name: 'Nguyễn Kiều Anh', age: 3, weight: 12 } as any;

    render(React.createElement(PrescriptionForm, { patient }));

    // Find and type into autocomplete
    const searchInput = screen.getByRole('combobox');
    fireEvent.change(searchInput, { target: { value: 'astemix' } });

    // Click candidate
    const option = screen.getByText('Astemix siro');
    fireEvent.click(option);

    // Verify row added with prefilled data
    await waitFor(() => {
      expect(screen.getByDisplayValue('Astemix siro')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Chai')).toBeInTheDocument();
      expect(screen.getByDisplayValue('30000')).toBeInTheDocument();
    });
  });

  it('Requirement: should trigger catalog invalidation upon successful prescription creation', async () => {
    mockCreatePrescription.mockResolvedValueOnce({
      success: true,
      data: { id: 850, patient_id: 96 },
    });

    const { default: PrescriptionForm } = await import('@/components/features/prescriptions/PrescriptionForm');
    const patient = { id: 96, name: 'Nguyễn Kiều Anh', age: 3, weight: 12 } as any;

    render(React.createElement(PrescriptionForm, { patient }));

    // Add diagnosis
    const diagnosisInput = screen.getByPlaceholderText(/nhập chẩn đoán/i);
    fireEvent.change(diagnosisInput, { target: { value: 'Viêm họng cấp' } });

    // Add medicine
    const searchInput = screen.getByRole('combobox');
    fireEvent.change(searchInput, { target: { value: 'astemix' } });
    fireEvent.click(screen.getByText('Astemix siro'));

    // Submit prescription
    const submitBtn = screen.getByRole('button', { name: /lưu đơn thuốc/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreatePrescription).toHaveBeenCalled();
      expect(mockInvalidateCatalog).toHaveBeenCalled();
    });
  });

  it('Requirement: should handle stock depletion error gracefully and trigger background revalidation', async () => {
    mockCreatePrescription.mockResolvedValueOnce({
      success: false,
      error: 'Kho không đủ thuốc: Astemix siro chỉ còn 0 chai',
    });

    const { default: PrescriptionForm } = await import('@/components/features/prescriptions/PrescriptionForm');
    const patient = { id: 96, name: 'Nguyễn Kiều Anh', age: 3, weight: 12 } as any;

    render(React.createElement(PrescriptionForm, { patient }));

    // Add diagnosis
    const diagnosisInput = screen.getByPlaceholderText(/nhập chẩn đoán/i);
    fireEvent.change(diagnosisInput, { target: { value: 'Viêm họng cấp' } });

    // Add medicine
    const searchInput = screen.getByRole('combobox');
    fireEvent.change(searchInput, { target: { value: 'astemix' } });
    fireEvent.click(screen.getByText('Astemix siro'));

    // Submit prescription
    const submitBtn = screen.getByRole('button', { name: /lưu đơn thuốc/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreatePrescription).toHaveBeenCalled();
      expect(screen.getByText(/Kho không đủ thuốc/i)).toBeInTheDocument();
      expect(mockInvalidateCatalog).toHaveBeenCalled();
    });
  });

  it('Requirement: should prevent duplicate medicine selection in prescription item list', async () => {
    const { default: PrescriptionForm } = await import('@/components/features/prescriptions/PrescriptionForm');
    const patient = { id: 96, name: 'Nguyễn Kiều Anh', age: 3, weight: 12 } as any;

    render(React.createElement(PrescriptionForm, { patient }));

    const searchInput = screen.getByRole('combobox');
    fireEvent.change(searchInput, { target: { value: 'astemix' } });
    fireEvent.click(screen.getByText('Astemix siro'));

    // Autocomplete excludes already selected item (excludeIds)
    fireEvent.change(searchInput, { target: { value: 'astemix' } });
    expect(screen.queryByText('Không tìm thấy kết quả') || screen.queryByRole('option')).toBeTruthy();
    
    // Only 1 item row in document
    const rows = screen.getAllByDisplayValue('Astemix siro');
    expect(rows).toHaveLength(1);
  });

  it('Requirement: should invalidate catalog when stock adjustment mutation is submitted', async () => {
    mockUpdateMedicineStock.mockResolvedValueOnce({ success: true });

    const { default: StockAdjustDialog } = await import('@/components/features/medicines/StockAdjustDialog');
    const sampleMedicine = {
      id: 101,
      name: 'Paracetamol 500mg vỉ xanh',
      stock_quantity: 50,
      price: 12000,
    } as any;

    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(React.createElement(StockAdjustDialog, {
      open: true,
      onClose,
      onSuccess,
      medicine: sampleMedicine,
    }));

    const adjustInput = screen.getByRole('spinbutton', { name: /số lượng thay đổi/i });
    fireEvent.change(adjustInput, { target: { value: '15' } });

    const reasonInput = screen.getByPlaceholderText(/nhập thêm hàng/i);
    fireEvent.change(reasonInput, { target: { value: 'Nhập kho bổ sung' } });

    const updateBtn = screen.getByRole('button', { name: /cập nhật/i });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(mockUpdateMedicineStock).toHaveBeenCalledWith(101, 15, 'Nhập kho bổ sung');
      expect(mockInvalidateCatalog).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
