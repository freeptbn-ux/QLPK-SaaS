# Phase 02: Tích hợp vào UI Components
Status: ✅ Completed
Dependencies: Phase 01

## Objective
Thay thế tất cả nơi hiển thị DOB raw bằng `formatAge()` trong 3 component chính: `PatientList`, `PatientDetail`, `PrescriptionForm`.

## Requirements

### Functional
- [x] **PatientList (Desktop table)**: Cột "Ngày sinh" hiển thị DOB kèm tuổi
  - Format: `01/03/2026 (7 tuần tuổi)` 
  - Nếu DOB invalid/trống: hiện `N/A`
- [x] **PatientList (Mobile card)**: Thay DOB bằng tuổi ngắn gọn
  - Format: `Nữ • 7 tuần tuổi`
  - Nếu DOB invalid/trống: hiện DOB gốc hoặc `N/A`
- [x] **PatientDetail**: Hiển thị cả DOB và tuổi
  - Format: `01/03/2026 (7 tuần tuổi)`
  - Label: giữ nguyên "Ngày sinh / Tuổi"
- [x] **PrescriptionForm**: Thay logic tính tuổi sai hiện tại
  - Hiện tại: `new Date().getFullYear() - new Date(patient.dob).getFullYear()` (SAI vì tính thô, không xử lý DD/MM/YYYY)
  - Sau: Dùng `formatAge(patient.dob)`

### Non-Functional
- [x] Không thay đổi logic business, chỉ thay đổi hiển thị
- [x] Giữ responsive layout không bị vỡ

## Implementation Steps

### 2.1 PatientList.tsx

1. [x] Import `formatAge` từ `@/lib/utils/age`

2. [x] **Desktop table** (line ~195): Thay `{patient.dob}` bằng:
   ```tsx
   <TableCell>
     {patient.dob || 'N/A'}
     {patient.dob && formatAge(patient.dob) && (
       <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
         {formatAge(patient.dob)}
       </Typography>
     )}
   </TableCell>
   ```

3. [x] **Mobile card** (line ~133): Thay `{patient.gender} • {patient.dob}` bằng:
   ```tsx
   {patient.gender} • {formatAge(patient.dob) || patient.dob || 'N/A'}
   ```

### 2.2 PatientDetail.tsx

4. [x] Import `formatAge` từ `@/lib/utils/age`

5. [x] Line ~112: Cập nhật hiển thị DOB + tuổi

### 2.3 PrescriptionForm.tsx

6. [x] Import `formatAge` từ `@/lib/utils/age`

7. [x] Line ~213: Thay đoạn tính tuổi inline

## Files to Modify
- `src/components/features/patients/PatientList.tsx` - Thêm import + sửa hiển thị DOB
- `src/components/features/patients/PatientDetail.tsx` - Thêm import + sửa hiển thị DOB  
- `src/components/features/prescriptions/PrescriptionForm.tsx` - Thay logic tính tuổi sai

## Test Criteria
- [x] Desktop table: Hiển thị DOB + tuổi bên dưới
- [x] Mobile card: Hiển thị tuổi thay vì DOB raw
- [x] Patient detail: DOB + (tuổi) trên cùng dòng
- [x] Prescription form: Tuổi chính xác (không dùng getFullYear trừ năm)
- [x] DOB trống/invalid: Hiện "N/A" hoặc "Không rõ tuổi", không crash
- [x] Legacy DOB format ("1990", "12 tháng"): Hiện DOB gốc, không lỗi
- [x] Build production thành công: `npm run build`

## Notes
- `formatAge` gọi 2 lần cho cùng DOB (1 lần check, 1 lần hiển thị) → Chấp nhận được vì hàm rất nhẹ, pure function
- Nếu muốn tối ưu sau: có thể dùng `useMemo` trong component

---
Next Phase: [phase-03-age-group-chart.md](./phase-03-age-group-chart.md)
