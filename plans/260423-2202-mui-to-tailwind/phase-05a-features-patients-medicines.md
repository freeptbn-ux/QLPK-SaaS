# Phase 05a: Feature Components - Patients & Medicines
Status: ⬜ Pending
Dependencies: Phase 03 (UI Primitives), Phase 04 (Layout)

## Objective
Chuyển đổi tất cả feature components liên quan đến **Bệnh nhân (Patients)** và **Kho thuốc (Medicines)** từ MUI sang Tailwind CSS. Đây là 2 module lớn nhất của ứng dụng.

## Requirements
### Functional
- [ ] Patient list: bảng danh sách, search, pagination, CRUD
- [ ] Patient detail: thông tin chi tiết, lịch sử khám, đơn thuốc
- [ ] Patient form dialog: thêm/sửa bệnh nhân  
- [ ] Medicine list: bảng danh sách, search, filter, CRUD
- [ ] Medicine form dialog: thêm/sửa thuốc
- [ ] Stock adjust dialog: điều chỉnh tồn kho
- [ ] Low stock alert: cảnh báo thuốc sắp hết

### Non-Functional
- [ ] Form validation UI giữ nguyên behavior (error states, helper text)
- [ ] react-hook-form integration không bị ảnh hưởng
- [ ] Không import `@mui/*`

## Implementation Steps

### Patient Components

#### 1. PatientSearch.tsx
1. [ ] Rewrite `src/components/features/patients/PatientSearch.tsx`:
   - **MUI removed**: `TextField`, `InputAdornment`, `IconButton`, `SearchIcon`, `ClearIcon`
   - **Tailwind**: Custom search input với icon prefix/suffix
   - **react-icons**: `HiOutlineMagnifyingGlass`, `HiOutlineXMark`

#### 2. PatientList.tsx
2. [ ] Rewrite `src/components/features/patients/PatientList.tsx`:
   - **MUI removed**: `Table`, `TableBody`, `TableCell`, `TableContainer`, `TableHead`, `TableRow`, `Paper`, `IconButton`, `TextField`, `InputAdornment`, `Button`, `Box`, `Chip`, `Tooltip`, `Typography`
   - **MUI icons removed**: `EditIcon`, `DeleteIcon`, `VisibilityIcon`
   - **Tailwind approach**:
     - `<table>` with `w-full` + custom styles
     - Hover row: `hover:bg-gray-50 dark:hover:bg-gray-800`
     - Status chips: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium`
   - **react-icons**: `HiOutlinePencil`, `HiOutlineTrash`, `HiOutlineEye`

#### 3. PatientFormDialog.tsx (⚠️ COMPLEX)
3. [ ] Rewrite `src/components/features/patients/PatientFormDialog.tsx`:
   - **MUI removed**: `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`, `Button`, `TextField`, `Grid`, `FormControl`, `FormLabel`, `RadioGroup`, `FormControlLabel`, `Radio`, `FormHelperText`, `Typography`, `Box`, `InfoOutlined`
   - **Key challenge**: Phải tạo custom components cho:
     - Modal/Dialog container
     - Text input field với error state + helper text
     - Radio button group
     - Grid layout cho form
   - **react-hook-form `Controller`** giữ nguyên - chỉ đổi render component
   - **react-icons**: `HiOutlineInformationCircle`

#### 4. PatientDetail.tsx
4. [ ] Rewrite `src/components/features/patients/PatientDetail.tsx`:
   - **MUI removed**: `Box`, `Card`, `CardContent`, `Typography`, `Button`, `Grid`, `Divider`, `Chip`, `Table`, `TableBody`, `TableCell`, `TableContainer`, `TableHead`, `TableRow`, `Paper`
   - **MUI icons removed**: `EditIcon`, `ArrowBackIcon`, `DeleteIcon`
   - **react-icons**: `HiOutlinePencil`, `HiOutlineArrowLeft`, `HiOutlineTrash`

#### 5. PrescriptionHistory.tsx
5. [ ] Rewrite `src/components/features/patients/PrescriptionHistory.tsx`:
   - **MUI removed**: Nhiều table + accordion components
   - **MUI icons removed**: Multiple icons
   - Kiểm tra chi tiết file để xác định approach

#### 6. MedicineUsageDialog.tsx
6. [ ] Rewrite `src/components/features/patients/MedicineUsageDialog.tsx`:
   - **MUI removed**: Dialog, Table, và các components liên quan
   - Reuse dialog pattern từ Phase 03 (ConfirmDialog)

### Medicine Components

#### 7. MedicineList.tsx
7. [ ] Rewrite `src/components/features/medicines/MedicineList.tsx`:
   - **MUI removed**: `Table`, `TableBody`, `TableCell`, `TableContainer`, `TableHead`, `TableRow`, `Paper`, `IconButton`, `TextField`, `InputAdornment`, `Button`, `Box`, `Chip`, `Tooltip`, `Typography`
   - **MUI icons removed**: `SearchIcon`, `EditIcon`, `DeleteIcon`, `AddIcon`, `InventoryIcon`
   - **Tailwind approach**: Tương tự PatientList
   - **react-icons**: `HiOutlineMagnifyingGlass`, `HiOutlinePencil`, `HiOutlineTrash`, `HiOutlinePlus`, `HiOutlineArchiveBox`

#### 8. MedicineFormDialog.tsx
8. [ ] Rewrite `src/components/features/medicines/MedicineFormDialog.tsx`:
   - **MUI removed**: Dialog, TextField, Grid, Button...
   - Reuse dialog + form patterns từ PatientFormDialog

#### 9. StockAdjustDialog.tsx
9. [ ] Rewrite `src/components/features/medicines/StockAdjustDialog.tsx`:
   - **MUI removed**: Dialog, TextField, Button...
   - Dialog nhỏ, đơn giản hơn form dialogs

#### 10. LowStockAlert.tsx
10. [ ] Rewrite `src/components/features/medicines/LowStockAlert.tsx`:
    - **MUI removed**: `Alert`, `AlertTitle`, `Button`, `Collapse`, `WarningAmberIcon`
    - **Tailwind**: Custom alert banner với `bg-amber-50 border-amber-200`
    - **react-icons**: `HiOutlineExclamationTriangle`

## Files to Modify
| File | Complexity | Key Challenges |
|------|-----------|----------------|
| `src/components/features/patients/PatientSearch.tsx` | 🟢 Low | Search input with icon |
| `src/components/features/patients/PatientList.tsx` | 🟡 Medium | Table + actions + chips |
| `src/components/features/patients/PatientFormDialog.tsx` | 🔴 High | Dialog + Form + Radio + Grid + react-hook-form |
| `src/components/features/patients/PatientDetail.tsx` | 🟡 Medium | Card + Table + Actions |
| `src/components/features/patients/PrescriptionHistory.tsx` | 🔴 High | Complex table + accordion |
| `src/components/features/patients/MedicineUsageDialog.tsx` | 🟡 Medium | Dialog + Table |
| `src/components/features/medicines/MedicineList.tsx` | 🟡 Medium | Table + Search + Filter + Actions |
| `src/components/features/medicines/MedicineFormDialog.tsx` | 🟡 Medium | Dialog + Form |
| `src/components/features/medicines/StockAdjustDialog.tsx` | 🟢 Low | Simple dialog + input |
| `src/components/features/medicines/LowStockAlert.tsx` | 🟢 Low | Alert banner |

## Common Patterns to Extract

Trước khi bắt đầu, nên tạo các reusable components/patterns:

### Table Pattern
```tsx
// Reusable table wrapper
<div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
  <table className="w-full text-sm">
    <thead className="bg-gray-50 dark:bg-gray-800">
      <tr>
        <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">...</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <td className="px-4 py-3">...</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Dialog Pattern (đã tạo ở Phase 03)
Reuse `ConfirmDialog` pattern cho tất cả dialogs lớn hơn.

### Form Input Pattern
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    Label
  </label>
  <input className="input-field" />
  {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
</div>
```

## Test Criteria
- [ ] Patient CRUD hoạt động đầy đủ (thêm, sửa, xóa, xem chi tiết)
- [ ] Medicine CRUD hoạt động đầy đủ
- [ ] Search/Filter hoạt động
- [ ] Form validation hiển thị lỗi đúng
- [ ] Low stock alert hiển thị và filter đúng
- [ ] Stock adjustment dialog hoạt động
- [ ] Prescription history hiển thị đúng
- [ ] Tất cả hoạt động trong Dark mode
- [ ] Responsive trên mobile

## Notes
- Phase này có **nhiều files nhất** và nên được chia thành sub-tasks.
- Nên làm Patient trước (vì phức tạp hơn), rồi áp dụng patterns cho Medicine.
- `PatientFormDialog` dùng `DateInput` (đã migrate Phase 03) và `Controller` từ react-hook-form.
- `MedicineList` dùng `ConfirmDialog` và `EmptyState` (đã migrate Phase 03).

---
Previous Phase: [phase-04-layout-navigation.md](./phase-04-layout-navigation.md)
Next Phase: [phase-05b-features-prescriptions-stats-settings.md](./phase-05b-features-prescriptions-stats-settings.md)
