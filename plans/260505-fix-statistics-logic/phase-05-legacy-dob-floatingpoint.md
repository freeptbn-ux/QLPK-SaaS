# Phase 05: Legacy DOB Handling + Floating-Point Precision

Status: ⬜ Pending
Dependencies: Không (có thể chạy song song)
Fixes: Bug #6 (🟡), Bug #7 (🟢 — đã partial fix ở Phase 01)

## Objective

1. **Bug #6:** Xử lý 20 bệnh nhân có DOB legacy (dạng "25 tuổi", "7 tháng",...)
2. **Bug #7:** Đảm bảo floating-point precision cho doanh thu thuốc

## Context — Dữ liệu DOB legacy

```
ISO (YYYY-MM-DD): 218 bệnh nhân ✅ → parseAgeParts() xử lý OK
VN (DD/MM/YYYY):    2 bệnh nhân ✅ → parseAgeParts() xử lý OK
LEGACY/OTHER:      20 bệnh nhân ❌ → parseAgeParts() return null → bị bỏ qua
```

Ví dụ DOB legacy:
```
"25 tuổi", "7 tháng", "15 tuổi", "14 tháng", "không tuổi",
"5.5 tuổi", "6 tuổi", "3,5 tuổi", "5 tuổi", "18 tháng", "30 tuổi"
```

## Analysis — Phương án xử lý DOB legacy

### Phương án A: Mở rộng `parseAgeParts()` để parse thêm format legacy
- ✅ Không cần sửa data trong DB
- ❌ Phức tạp: regex khó cover hết edge case ("3,5 tuổi", "không tuổi")
- ❌ DOB legacy là tuổi tại thời điểm nhập, không phải ngày sinh thật → tính tuổi không chính xác

### Phương án B: Tạo helper `parseLegacyAge()` chuyển text → nhóm tuổi trực tiếp
- ✅ Đơn giản, chỉ cần map text → group (không cần tính ngày sinh)
- ✅ Handle edge case dễ hơn
- ❌ Chỉ dùng cho AgeGroupChart, không reuse được

### Phương án C: Migrate data trong DB (chuyển "25 tuổi" → ước tính YYYY-MM-DD)
- ✅ Fix tận gốc
- ❌ Mất chính xác (25 tuổi → sinh năm 2001, nhưng không biết tháng/ngày)
- ❌ Cần backup + migration phức tạp

### **→ Chọn Phương án B** (parse trực tiếp sang nhóm tuổi, đơn giản và chính xác nhất cho mục đích thống kê)

## Implementation Steps

### Step 1: Tạo helper `parseLegacyAgeGroup()` 

File: `src/lib/utils/age.ts` — thêm function mới

```typescript
/**
 * Parse DOB dạng legacy ("25 tuổi", "7 tháng", "5.5 tuổi") → age group name.
 * Chỉ dùng cho AgeGroupChart khi parseAgeParts() trả về null.
 * 
 * Returns tên nhóm tuổi trực tiếp, hoặc null nếu không parse được.
 */
export function parseLegacyAgeGroup(dob: string): string | null {
  if (!dob) return null;
  
  const normalized = dob.trim().toLowerCase();
  
  // Pattern: "X tháng" hoặc "X tháng tuổi"
  const monthMatch = normalized.match(/^(\d+(?:[.,]\d+)?)\s*tháng/);
  if (monthMatch) {
    const months = parseFloat(monthMatch[1].replace(',', '.'));
    if (months <= 2) return '0-2 tháng';
    if (months <= 6) return '2-6 tháng';
    if (months <= 24) return '6 tháng-2 tuổi';
    return '2-6 tuổi'; // > 24 months = > 2 years
  }
  
  // Pattern: "X tuổi" hoặc "X,Y tuổi" hoặc "X.Y tuổi"
  const yearMatch = normalized.match(/^(\d+(?:[.,]\d+)?)\s*tuổi/);
  if (yearMatch) {
    const years = parseFloat(yearMatch[1].replace(',', '.'));
    const ageInMonths = years * 12;
    if (ageInMonths <= 2) return '0-2 tháng';
    if (ageInMonths <= 6) return '2-6 tháng';
    if (ageInMonths <= 24) return '6 tháng-2 tuổi';
    if (ageInMonths <= 72) return '2-6 tuổi';
    if (ageInMonths <= 192) return '6-16 tuổi';
    return 'Người lớn';
  }
  
  // Không nhận dạng được (VD: "không tuổi")
  return null;
}
```

### Step 2: Cập nhật `AgeGroupChart.tsx` để dùng legacy fallback

File: `src/components/features/statistics/AgeGroupChart.tsx` (dòng 20-63)

```tsx
// TRƯỚC:
import { parseAgeParts } from '@/lib/utils/age';

// SAU:
import { parseAgeParts, parseLegacyAgeGroup } from '@/lib/utils/age';
```

Sửa logic trong `useMemo` (dòng 31-60):

```tsx
// TRƯỚC:
dobs.forEach((dob) => {
  const parts = parseAgeParts(dob);
  if (!parts) return; // Skip invalid/legacy DOBs
  // ... tính ageInMonths ...
});

// SAU:
dobs.forEach((dob) => {
  const parts = parseAgeParts(dob);
  
  if (!parts) {
    // Fallback: try parse legacy format ("25 tuổi", "7 tháng",...)
    const legacyGroup = parseLegacyAgeGroup(dob);
    if (legacyGroup && legacyGroup in groups) {
      groups[legacyGroup as keyof typeof groups]++;
    }
    return;
  }
  
  // ... phần tính ageInMonths giữ nguyên ...
});
```

### Step 3: Bug #7 — Floating-Point (đã partial fix ở Phase 01)

Phase 01 đã thêm `ROUND(..., 2)` vào RPC `get_medicine_usage_stats`.

Nếu muốn fix triệt để hơn, cân nhắc đổi kiểu cột `unit_price` từ `real` (float4) sang `numeric(10,2)`:

```sql
-- ⚠️ CÂN NHẮC KỸ: migration này ảnh hưởng nhiều chỗ
-- ALTER TABLE prescription_details ALTER COLUMN unit_price TYPE numeric(10,2);
-- ALTER TABLE medicines ALTER COLUMN price TYPE numeric(10,2);
```

**→ Khuyến nghị: KHÔNG đổi kiểu cột ở phase này.** `ROUND(..., 2)` ở Phase 01 đã đủ. Đổi schema cần audit kỹ toàn bộ code insert/update.

## Files to Modify
- `src/lib/utils/age.ts` — thêm function `parseLegacyAgeGroup()`
- `src/components/features/statistics/AgeGroupChart.tsx` — thêm fallback logic

## Test Criteria
- [ ] DOB "25 tuổi" → xếp vào nhóm "Người lớn" ✅
- [ ] DOB "7 tháng" → xếp vào nhóm "2-6 tháng" ✅ 
- [ ] DOB "5.5 tuổi" → xếp vào nhóm "2-6 tuổi" ✅
- [ ] DOB "3,5 tuổi" → xếp vào nhóm "2-6 tuổi" ✅
- [ ] DOB "18 tháng" → xếp vào nhóm "6 tháng-2 tuổi" ✅
- [ ] DOB "không tuổi" → bị bỏ qua (return null) ✅
- [ ] DOB format chuẩn (YYYY-MM-DD) vẫn hoạt động bình thường
- [ ] Biểu đồ AgeGroupChart tổng số = khoảng 240 (bao gồm ~20 DOB legacy)
- [ ] MedicineUsageTable hiển thị số tiền tròn (VD: 3.721 đ thay vì 3721.8000640869136)

## Notes

**Tại sao không migrate data DOB legacy?**
- DOB "25 tuổi" là tuổi tại thời điểm nhập, không phải ngày sinh chính xác
- Nếu migrate sang "2001-01-01", sẽ SAI sau mỗi năm (vì tuổi tăng)
- Tốt hơn là parse trực tiếp sang nhóm tuổi cho mục đích thống kê
- Khi phòng khám nhập bệnh nhân mới, khuyến khích nhập đúng format DD/MM/YYYY

---
Next Phase: → phase-06-testing-verification.md
