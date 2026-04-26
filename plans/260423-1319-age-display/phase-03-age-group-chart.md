# Phase 03: Cập nhật AgeGroupChart
Status: ✅ Completed
Dependencies: Phase 01

## Objective
Refactor `AgeGroupChart.tsx` để sử dụng `parseAgeParts()` từ shared utility thay vì logic tính tuổi inline, đảm bảo nhất quán với quy tắc tuổi mới.

## Requirements

### Functional
- [x] Sử dụng `parseAgeParts()` từ `@/lib/utils/age` để tính tuổi
- [x] Cập nhật nhóm tuổi cho khớp với quy tắc mới:

| Nhóm hiện tại | Nhóm mới (khớp với formatAge) |
|---|---|
| `0-2 tháng` | `< 7 ngày` (ngày tuổi) |
| `2-6 tháng` | `1-8 tuần` (tuần tuổi) |
| `6 tháng-2 tuổi` | `2-12 tháng` |
| `2-6 tuổi` | `12-72 tháng` |
| `6-16 tuổi` | `6-16 tuổi` |
| `Người lớn` | `> 16 tuổi` |

- [x] Xử lý DOB format `DD/MM/YYYY` (mới) lẫn format cũ (legacy)

### Non-Functional
- [x] Giữ nguyên UI/style chart (không thay đổi giao diện)
- [x] Performance: Không chậm hơn trước (vẫn O(n) duyệt DOBs)

## Implementation Steps

1. [x] Import `parseAgeParts` từ `@/lib/utils/age`

2. [x] Thay logic tính tuổi inline bằng `parseAgeParts`:
   ```typescript
   dobs.forEach((dob) => {
     const parts = parseAgeParts(dob);
     if (!parts) return; // Skip invalid DOBs
     
     // Convert to months for grouping
     let ageInMonths: number;
     switch (parts.unit) {
       case 'day': ageInMonths = 0; break;
       case 'week': ageInMonths = parts.value / 4.33; break;
       case 'month': ageInMonths = parts.value; break;
       case 'year': ageInMonths = parts.value * 12; break;
     }
     
     // Group logic
     if (ageInMonths <= 2) groups['0-2 tháng']++;
     else if (ageInMonths <= 6) groups['2-6 tháng']++;
     else if (ageInMonths <= 24) groups['6 tháng-2 tuổi']++;
     else if (ageInMonths <= 72) groups['2-6 tuổi']++;
     else if (ageInMonths <= 192) groups['6-16 tuổi']++;
     else groups['Người lớn']++;
   });
   ```

3. [x] Xóa import/logic `dayjs` cũ (không cần nữa vì `parseAgeParts` đã xử lý)

## Files to Modify
- `src/components/features/statistics/AgeGroupChart.tsx` - Refactor logic tính tuổi

## Test Criteria
- [x] Chart vẫn render đúng với dữ liệu DOB format `DD/MM/YYYY`
- [x] DOB legacy (format cũ) bị skip (không crash)
- [x] Phân bố nhóm tuổi logic (trẻ sơ sinh vào nhóm 0-2 tháng)
- [x] Build production thành công

## Notes
- Phase này có thể chạy song song với Phase 02 (cả 2 chỉ depend Phase 01)
- Nhóm tuổi chart giữ nguyên tên cũ để không confuse user đã quen

---
✅ Hoàn thành Plan!
