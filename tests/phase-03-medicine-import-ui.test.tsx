import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import React from 'react';
import * as path from 'path';
import * as fs from 'fs';
import * as XLSX from 'xlsx';
import MedicineList from '@/components/features/medicines/MedicineList';
import MedicineImportModal from '@/components/features/medicines/MedicineImportModal';
import { Medicine, MedicineAlias } from '@/types/database';

// -----------------------------------------------------------------------------
// Mocks
// -----------------------------------------------------------------------------

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/medicines',
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockShowToast = vi.fn();
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

const mockImportMedicineStockBatch = vi.fn();
const mockSaveMedicineAliases = vi.fn();
const mockGetMedicineAliases = vi.fn();
const mockInvalidateMedicineCatalog = vi.fn();

vi.mock('@/actions/medicines', () => ({
  deleteMedicine: vi.fn(),
  updateMedicineStock: vi.fn(),
  getAllMedicines: vi.fn(),
  getAllActiveMedicines: vi.fn(),
  getMedicineAliases: (...args: any[]) => mockGetMedicineAliases(...args),
  saveMedicineAliases: (...args: any[]) => mockSaveMedicineAliases(...args),
  importMedicineStockBatch: (...args: any[]) => mockImportMedicineStockBatch(...args),
}));

vi.mock('@/hooks/useMedicineCatalog', () => ({
  useMedicineCatalog: vi.fn(),
  invalidateMedicineCatalog: (...args: any[]) => mockInvalidateMedicineCatalog(...args),
  clearMedicineCatalogCache: vi.fn(),
}));

import { useMedicineCatalog } from '@/hooks/useMedicineCatalog';

// -----------------------------------------------------------------------------
// Test Fixtures
// -----------------------------------------------------------------------------

const mockCatalog: Medicine[] = [
  {
    id: 5,
    clinic_id: 1,
    name: 'ATErsin',
    packing_spec: 'Hộp 1 chai 60ml',
    unit: 'Chai',
    price: 26000,
    stock_quantity: 10,
    min_stock_level: 5,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 70,
    clinic_id: 1,
    name: 'Neo-Beta',
    packing_spec: 'Lọ 5ml',
    unit: 'Lọ',
    price: 15000,
    stock_quantity: 18,
    min_stock_level: 5,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 136,
    clinic_id: 1,
    name: 'Paracetamol 325mg Agimol',
    packing_spec: 'Gói',
    unit: 'Gói',
    price: 1500,
    stock_quantity: 25,
    min_stock_level: 10,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 187,
    clinic_id: 1,
    name: 'Augixine 250mg',
    packing_spec: 'Hộp',
    unit: 'Hộp',
    price: 23000,
    stock_quantity: 4,
    min_stock_level: 5,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 200,
    clinic_id: 1,
    name: 'Alternate Medicine Alpha',
    packing_spec: 'Chai 100ml',
    unit: 'Chai',
    price: 50000,
    stock_quantity: 12,
    min_stock_level: 5,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
];

/**
 * Creates an in-memory XLSX File object with the specified rows
 */
function createSyntheticExcelFile(dataRows: any[][], fileName = 'test_import.xlsx'): File {
  const ws = XLSX.utils.aoa_to_sheet(dataRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new File([buffer], fileName, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

// -----------------------------------------------------------------------------
// Test Suite: Phase 03 Interactive Reconciliation Modal & Catalog Sync
// -----------------------------------------------------------------------------

describe('Phase 03: Interactive Reconciliation Modal & Catalog Sync UI Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useMedicineCatalog as any).mockReturnValue({
      medicines: mockCatalog,
      isLoading: false,
      isValidating: false,
      error: null,
      invalidate: mockInvalidateMedicineCatalog,
      refetch: vi.fn(),
    });

    mockGetMedicineAliases.mockResolvedValue([]);
    mockImportMedicineStockBatch.mockResolvedValue({
      success: true,
      updated_count: 2,
      created_count: 1,
      created_ids: [999],
    });
    mockSaveMedicineAliases.mockResolvedValue([]);
    mockInvalidateMedicineCatalog.mockResolvedValue(mockCatalog);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // 1. Modal Trigger Test
  // ---------------------------------------------------------------------------
  it('1. Modal Trigger Test: renders MedicineList and verifies clicking "Nhập thuốc" opens the import dialog', async () => {
    render(
      <MedicineList
        initialData={mockCatalog}
        totalCount={mockCatalog.length}
        currentPage={1}
        limit={20}
        totalLowStockCount={1}
      />
    );

    // Verify "Nhập thuốc" button is present in the toolbar
    const importButton = screen.getByRole('button', { name: /nhập thuốc/i });
    expect(importButton).toBeDefined();

    // Verify modal is not yet open
    expect(screen.queryByRole('dialog')).toBeNull();

    // Click "Nhập thuốc"
    fireEvent.click(importButton);

    // Verify modal opens with title and upload dropzone
    const modal = await screen.findByRole('dialog');
    expect(modal).toBeDefined();
    expect(screen.getByText('Nhập thuốc từ file Excel / CSV')).toBeDefined();
    expect(
      screen.getByText(/kéo thả file bảng tính vào đây, hoặc nhấn để chọn file/i)
    ).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  // 2. Spreadsheet Ingestion & Rendering Test
  // ---------------------------------------------------------------------------
  it('2. Spreadsheet Ingestion & Rendering Test: simulates dropping an Excel file with confident, suggested, and unmatched rows; asserts table, stock, and badges', async () => {
    const file = createSyntheticExcelFile([
      ['Tên thuốc', 'Số lượng', 'Quy cách', 'Đơn giá'],
      ['ATErsin', 20, 'Hộp 1 chai 60ml', 26000], // Confident match with Med 5 (stock 10)
      ['Augxicine 250mg/31,25mg', 15, 'Hộp', 23000], // Suggested fuzzy match with Med 187 (Augixine 250mg, stock 4)
      ['Thuốc Đặc Trị Chưa Có 500mg', 30, 'Lọ 100 viên', 120000], // Unmatched
    ]);

    const { container } = render(
      <MedicineImportModal
        open={true}
        onClose={vi.fn()}
        catalog={mockCatalog}
      />
    );

    // Trigger file drop / input change
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).not.toBeNull();

    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for the reconciliation table to render
    await screen.findByRole('table');

    // 2.1 Verify raw names from Excel are rendered
    expect(screen.getAllByText('ATErsin').length).toBeGreaterThan(0);
    expect(screen.getByText('Augxicine 250mg/31,25mg')).toBeDefined();
    expect(screen.getByText('Thuốc Đặc Trị Chưa Có 500mg')).toBeDefined();

    // 2.2 Verify status badges
    expect(screen.getAllByText(/khớp chính xác/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/cần kiểm tra/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/chưa khớp/i).length).toBeGreaterThan(0);

    // 2.3 Verify stock numbers for Confident row (ATErsin: old stock 10, +20, =30)
    expect(screen.getByText('+20')).toBeDefined();
    expect(screen.getByText('=30')).toBeDefined();

    // 2.4 Verify stock numbers for Suggested row (Augxicine -> Augixine: old stock 4, +15, =19)
    expect(screen.getByText('+15')).toBeDefined();
    expect(screen.getByText('=19')).toBeDefined();

    // 2.5 Verify summary counter pills
    expect(screen.getByText(/tổng cộng/i)).toBeDefined();
    expect(screen.getByText(/khớp chính xác: 1/i)).toBeDefined();
    expect(screen.getByText(/cần kiểm tra: 1/i)).toBeDefined();
    expect(screen.getByText(/chưa khớp: 1/i)).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  // Real-World Acceptance Criteria 2: Uploading Danh_sach_thuoc.xlsx (10 rows)
  // ---------------------------------------------------------------------------
  it('2.1 Real-World Fixture: renders all 10 rows when uploading Danh_sach_thuoc.xlsx', async () => {
    const realExcelPath = path.resolve(process.cwd(), 'Danh_sach_thuoc.xlsx');
    expect(fs.existsSync(realExcelPath)).toBe(true);

    const fileBuffer = fs.readFileSync(realExcelPath);
    const file = new File([fileBuffer], 'Danh_sach_thuoc.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const { container } = render(
      <MedicineImportModal
        open={true}
        onClose={vi.fn()}
        catalog={mockCatalog}
      />
    );

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    await screen.findByRole('table');

    // Verify 10 rows in table body
    const tableRows = container.querySelectorAll('tbody tr');
    expect(tableRows.length).toBe(10);
  });

  // ---------------------------------------------------------------------------
  // 3. Manual Selection Override Test
  // ---------------------------------------------------------------------------
  it('3. Manual Selection Override Test: simulates opening autocomplete on a suggested row, searching alternate medicine, and selecting it', async () => {
    const file = createSyntheticExcelFile([
      ['Tên thuốc', 'Số lượng', 'Quy cách', 'Đơn giá'],
      ['Augxicine 250mg/31,25mg', 15, 'Hộp', 23000], // Suggested
    ]);

    const { container } = render(
      <MedicineImportModal
        open={true}
        onClose={vi.fn()}
        catalog={mockCatalog}
      />
    );

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    await screen.findByRole('table');

    // Row is initially pre-selected with suggested Augixine 250mg (stock 4, resulting stock =19)
    expect(screen.getByText('Augixine 250mg')).toBeDefined();
    expect(screen.getByText('=19')).toBeDefined();

    // Click "Đổi thuốc" button to open autocomplete
    const changeMedicineButton = screen.getByRole('button', { name: /đổi thuốc/i });
    fireEvent.click(changeMedicineButton);

    // Search input should appear
    const searchInput = screen.getByRole('searchbox', { name: /tìm thuốc trong kho/i });
    expect(searchInput).toBeDefined();

    // Type query to find "Alternate Medicine Alpha" (Med 200, current stock 12)
    fireEvent.change(searchInput, { target: { value: 'Alternate' } });

    // Click the matching medicine option
    const optionButton = screen.getByRole('button', { name: /alternate medicine alpha/i });
    fireEvent.click(optionButton);

    // Verify target medicine updated to Alternate Medicine Alpha
    expect(screen.getByText('Alternate Medicine Alpha')).toBeDefined();

    // Verify stock recalculated: old stock 12 + SL 15 = 27
    expect(screen.getByText('12')).toBeDefined();
    expect(screen.getByText('+15')).toBeDefined();
    expect(screen.getByText('=27')).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  // 4. Unmatched Item "Create New Medicine" Test
  // ---------------------------------------------------------------------------
  it('4. Unmatched Item "Create New Medicine" Test: toggles "Tạo thuốc mới" checkbox on unmatched row and prepares new medicine data', async () => {
    const file = createSyntheticExcelFile([
      ['Tên thuốc', 'Số lượng', 'Quy cách', 'Đơn giá'],
      ['Thuốc Đặc Trị Chưa Có 500mg', 30, 'Lọ 100 viên', 120000], // Unmatched
    ]);

    const { container } = render(
      <MedicineImportModal
        open={true}
        onClose={vi.fn()}
        catalog={mockCatalog}
      />
    );

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    await screen.findByRole('table');

    // Initially unmatched
    expect(screen.getAllByText(/chưa khớp/i).length).toBeGreaterThan(0);

    // Find the "Tạo thuốc mới" checkbox
    const createNewCheckbox = screen.getByRole('checkbox', {
      name: /tạo thuốc mới cho thuốc đặc trị chưa có 500mg/i,
    });
    expect((createNewCheckbox as HTMLInputElement).checked).toBe(false);

    // Toggle on "Tạo thuốc mới"
    fireEvent.click(createNewCheckbox);
    expect((createNewCheckbox as HTMLInputElement).checked).toBe(true);

    // Verify target display indicates new creation
    expect(screen.getByText(/tạo mới: thuốc đặc trị chưa có 500mg/i)).toBeDefined();

    // Verify status badge updated to "Tạo mới"
    expect(screen.getAllByText(/tạo mới/i).length).toBeGreaterThan(0);

    // Verify stock diff displays: old stock 0, +30, =30
    expect(screen.getByText('0')).toBeDefined();
    expect(screen.getByText('+30')).toBeDefined();
    expect(screen.getByText('=30')).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  // 5. Batch Submission Test
  // ---------------------------------------------------------------------------
  it('5. Batch Submission Test: executes batch import, saves confirmed aliases, busts cache, and shows success toast', async () => {
    const mockOnClose = vi.fn();
    const mockOnSuccess = vi.fn();

    const file = createSyntheticExcelFile([
      ['Tên thuốc', 'Số lượng', 'Quy cách', 'Đơn giá'],
      ['ATErsin', 20, 'Hộp 1 chai 60ml', 26000], // Confident: Med 5
      ['Augxicine 250mg/31,25mg', 15, 'Hộp', 23000], // Suggested: will manually reassign to Med 200
      ['Thuốc Đặc Trị Chưa Có 500mg', 30, 'Lọ 100 viên', 120000], // Unmatched: will check "Tạo thuốc mới"
    ]);

    const { container } = render(
      <MedicineImportModal
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        catalog={mockCatalog}
      />
    );

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    await screen.findByRole('table');

    // 1. Manually reassign row 2 (Augxicine) to Med 200 (Alternate Medicine Alpha)
    const changeMedicineButtons = screen.getAllByRole('button', { name: /đổi thuốc/i });
    fireEvent.click(changeMedicineButtons[1]); // Row 2 is suggested Augxicine
    const searchInput = screen.getByRole('searchbox', { name: /tìm thuốc trong kho/i });
    fireEvent.change(searchInput, { target: { value: 'Alternate' } });
    const optionButton = screen.getByRole('button', { name: /alternate medicine alpha/i });
    fireEvent.click(optionButton);

    // 2. Toggle "Tạo thuốc mới" on row 3 (Thuốc Đặc Trị Chưa Có 500mg)
    const createNewCheckbox = screen.getByRole('checkbox', {
      name: /tạo thuốc mới cho thuốc đặc trị chưa có 500mg/i,
    });
    fireEvent.click(createNewCheckbox);

    // 3. Click "Xác nhận nhập kho"
    const submitButton = screen.getByRole('button', { name: /xác nhận nhập kho/i });
    fireEvent.click(submitButton);

    // Verify loading state
    expect(screen.getByText(/đang cập nhật kho.../i)).toBeDefined();

    await waitFor(() => {
      // 5.1 Verify importMedicineStockBatch call
      expect(mockImportMedicineStockBatch).toHaveBeenCalledTimes(1);
      const callArgs = mockImportMedicineStockBatch.mock.calls[0][0];

      // Verify adjustments: Med 5 (+20) and Med 200 (+15)
      expect(callArgs.adjustments).toEqual(
        expect.arrayContaining([
          { medicine_id: 5, quantity: 20 },
          { medicine_id: 200, quantity: 15 },
        ])
      );

      // Verify newMedicines payload
      expect(callArgs.newMedicines).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Thuốc Đặc Trị Chưa Có 500mg',
            initial_stock: 30,
            packing_spec: 'Lọ 100 viên',
            price: 120000,
          }),
        ])
      );

      expect(callArgs.reason).toBe('IMPORT_EXCEL');

      // 5.2 Verify saveMedicineAliases call with manually overridden alias
      expect(mockSaveMedicineAliases).toHaveBeenCalledTimes(1);
      expect(mockSaveMedicineAliases).toHaveBeenCalledWith(
        expect.arrayContaining([
          {
            raw_name: 'Augxicine 250mg/31,25mg',
            medicine_id: 200,
          },
        ])
      );

      // 5.3 Verify cache invalidation
      expect(mockInvalidateMedicineCatalog).toHaveBeenCalledTimes(1);

      // 5.4 Verify success toast and modal close
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining('Nhập kho thành công'),
        'success'
      );
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Error Resilience Test
  // ---------------------------------------------------------------------------
  it('6. Error Resilience Test: simulates server failure during submission and verifies error alert while keeping mapping intact', async () => {
    mockImportMedicineStockBatch.mockRejectedValueOnce(
      new Error('Lỗi máy chủ cơ sở dữ liệu: Lock timeout hoặc đường truyền gián đoạn')
    );

    const mockOnClose = vi.fn();

    const file = createSyntheticExcelFile([
      ['Tên thuốc', 'Số lượng', 'Quy cách', 'Đơn giá'],
      ['ATErsin', 20, 'Hộp 1 chai 60ml', 26000],
    ]);

    const { container } = render(
      <MedicineImportModal
        open={true}
        onClose={mockOnClose}
        catalog={mockCatalog}
      />
    );

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    await screen.findByRole('table');

    // Click "Xác nhận nhập kho"
    const submitButton = screen.getByRole('button', { name: /xác nhận nhập kho/i });
    fireEvent.click(submitButton);

    // Wait for the failure to be handled
    await waitFor(() => {
      // 6.1 Verify error alert appears
      const alert = screen.getByRole('alert');
      expect(alert).toBeDefined();
      expect(alert.textContent).toContain('Lỗi máy chủ cơ sở dữ liệu');

      // 6.2 Verify modal was NOT closed
      expect(mockOnClose).not.toHaveBeenCalled();

      // 6.3 Verify table rows and user selections remain intact in dialog
      expect(screen.getAllByText('ATErsin').length).toBeGreaterThan(0);
      expect(screen.getByText('+20')).toBeDefined();
      expect(screen.getByText('=30')).toBeDefined();
    });
  });
});
