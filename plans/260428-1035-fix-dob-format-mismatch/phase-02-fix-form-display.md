# Phase 02: Fix Form Dialog + Display Format

Status: ✅ Completed
Dependencies: Phase 01 (parseDob đã hỗ trợ YYYY-MM-DD)

## Objective

Sửa `PatientFormDialog` để không coi `YYYY-MM-DD` là "format cũ" nữa. Sửa `PatientDetail` để hiển thị DOB dạng `DD/MM/YYYY` cho user thay vì raw ISO.

## Implementation Steps

### 1. Sửa `PatientFormDialog.tsx` — dob edit logic

**Vấn đề hiện tại (line 50, 53, 178):**
```typescript
// Coi YYYY-MM-DD là "format cũ" → xóa trắng dob khi edit
const isOldFormat = patient.dob && !/^\d{2}\/\d{2}\/\d{4}$/.test(patient.dob);
dob: isOldFormat ? '' : (patient.dob || ''),
```

Khi edit bệnh nhân có `dob = '2025-02-16'`, form hiện dob trống và cảnh báo "Format cũ".

**Cần sửa:**

- [ ] Thêm helper `formatDobForInput(dob: string): string` trong `age.ts`:
  - Nếu `YYYY-MM-DD` → convert sang `DD/MM/YYYY` 
  - Nếu `DD/MM/YYYY` → giữ nguyên
  - Nếu khác → trả `''`

```typescript
export function formatDobForInput(dob: string): string {
  if (!dob) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) return dob; // already DD/MM/YYYY
  if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    const [yyyy, mm, dd] = dob.split('-');
    return `${dd}/${mm}/${yyyy}`;
  }
  return ''; // unrecognized format
}
```

- [ ] Sửa `PatientFormDialog.tsx` line 50-53:

```typescript
// BEFORE:
const isOldFormat = patient.dob && !/^\d{2}\/\d{2}\/\d{4}$/.test(patient.dob);
dob: isOldFormat ? '' : (patient.dob || ''),

// AFTER:
dob: formatDobForInput(patient.dob || ''),
```

- [ ] Sửa `PatientFormDialog.tsx` line 178 — cập nhật điều kiện cảnh báo "Format cũ":

```typescript
// BEFORE: coi YYYY-MM-DD là format cũ
{patient && patient.dob && !/^\d{2}\/\d{2}\/\d{4}$/.test(patient.dob) && (

// AFTER: chỉ cảnh báo nếu format thật sự không parse được (không phải YYYY-MM-DD)
{patient && patient.dob && !formatDobForInput(patient.dob) && (
```

### 2. Sửa `PatientDetail.tsx` — hiển thị DOB

**Vấn đề hiện tại (line 82):**
```tsx
{patient.dob || 'N/A'}  // Hiện raw "2025-02-16" cho user
```

**Cần sửa:**

- [ ] Dùng `formatDobForInput()` để hiện `DD/MM/YYYY` cho user:

```tsx
{patient.dob ? formatDobForInput(patient.dob) : 'N/A'}
```

### 3. Kiểm tra `PatientList.tsx` và `PatientListClient.tsx`

- [ ] Xác nhận 2 file này chỉ dùng `formatAge()` — đã tự fix sau Phase 01
- [ ] Không cần sửa thêm (chỉ hiện tuổi, không hiện raw dob)

## Files to Modify

| File | Action | Mô tả |
|------|--------|-------|
| `src/lib/utils/age.ts` | MODIFY | Thêm export `formatDobForInput()` |
| `src/components/features/patients/PatientFormDialog.tsx` | MODIFY | Sửa logic detect "format cũ" |
| `src/components/features/patients/PatientDetail.tsx` | MODIFY | Hiển thị DOB dạng `DD/MM/YYYY` |

## Test Criteria

- [ ] Edit bệnh nhân "Nguyễn Quang Hoàng Đức" → form hiện `16/02/2025` (không trống)
- [ ] Không còn cảnh báo "Format cũ" khi edit bệnh nhân có dob `YYYY-MM-DD`
- [ ] Trang chi tiết bệnh nhân hiện `16/02/2025 (14 tháng tuổi)` thay vì `2025-02-16`
- [ ] Bệnh nhân có dob `DD/MM/YYYY` vẫn hoạt động bình thường (backward compatible)

---
Next Phase: [phase-03-verify-regression.md](./phase-03-verify-regression.md)
