# Phase 01: Thêm hàm format ngày sinh (DD/MM/YYYY)

Status: ✅ Completed
Dependencies: Không

## Objective

Tạo hàm tiện ích `formatDob()` trong `src/lib/utils/date.ts` để chuyển đổi ngày sinh từ dạng ISO (`YYYY-MM-DD` hoặc full ISO string) sang dạng `DD/MM/YYYY` thân thiện với người dùng Việt Nam.

## Context

Hiện tại cột "Ngày sinh" đang hiển thị raw value từ database (dạng `YYYY-MM-DD`):

```tsx
// PatientListClient.tsx - Line 184 (hiện tại)
<div className="text-slate-700 dark:text-slate-300 font-medium">
  {patient.dob || 'N/A'}
</div>
```

Cần chuyển thành dạng `DD/MM/YYYY` (VD: `15/03/1990`).

## Implementation Steps

1. [x] Mở file `src/lib/utils/date.ts`
2. [x] Thêm hàm `formatDob(dob: string | null): string` với logic:
   - Nếu `dob` là `null` hoặc rỗng → return `'N/A'`
   - Parse string thành `Date` object
   - Nếu invalid date → return `'N/A'`
   - Format thành `DD/MM/YYYY` (dùng `padStart(2, '0')` cho ngày/tháng)
3. [x] Export hàm `formatDob`

## Code mẫu

```typescript
/**
 * Format ngày sinh sang dạng DD/MM/YYYY
 * @param dob - Ngày sinh dạng ISO string (YYYY-MM-DD) hoặc null
 * @returns Chuỗi DD/MM/YYYY hoặc 'N/A' nếu không có dữ liệu
 */
export function formatDob(dob: string | null): string {
  if (!dob) return 'N/A';

  const date = new Date(dob);
  if (isNaN(date.getTime())) return 'N/A';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}
```

## Files to Create/Modify
- `src/lib/utils/date.ts` — Thêm hàm `formatDob()`

## Test Criteria
- [x] `formatDob('1990-03-15')` → `'15/03/1990'`
- [x] `formatDob('2000-01-01')` → `'01/01/2000'`
- [x] `formatDob(null)` → `'N/A'`
- [x] `formatDob('')` → `'N/A'`
- [x] `formatDob('invalid')` → `'N/A'`

---
Next Phase: [phase-02-update-table.md](./phase-02-update-table.md)
