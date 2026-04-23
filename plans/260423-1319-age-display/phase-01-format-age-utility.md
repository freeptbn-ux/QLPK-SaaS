# Phase 01: Utility Function `formatAge`
Status: ✅ Completed
Dependencies: Không

## Objective
Tạo pure function `formatAge(dob: string): string` trong `src/lib/utils/age.ts` để tính và format tuổi bệnh nhân dựa trên DOB format `DD/MM/YYYY`.

## Quy tắc hiển thị

```
Ngày hiện tại - DOB:
  < 7 ngày         → "{n} ngày tuổi"        (VD: "3 ngày tuổi")
  7 ngày → < 2 tháng → "{n} tuần tuổi"      (VD: "5 tuần tuổi")
  2 tháng → < 6 tuổi → "{n} tháng tuổi"     (VD: "18 tháng tuổi")
  ≥ 6 tuổi          → "{n} tuổi"             (VD: "8 tuổi")
```

## Requirements

### Functional
- [x] Parse DOB từ format `DD/MM/YYYY`
- [x] Tính khoảng cách thời gian đến ngày hiện tại
- [x] Áp dụng quy tắc phân loại tuổi (4 mức)
- [x] Trả về string đã format
- [x] Xử lý edge case: DOB null/empty/invalid → trả về `''`
- [x] Xử lý legacy DOB format cũ (VD: `"1990"`, `"12 tháng"`) → trả về `''`
- [x] Export thêm helper `parseAgeParts(dob: string)` trả về `{ value: number, unit: 'day'|'week'|'month'|'year' }` để `AgeGroupChart` có thể dùng

### Non-Functional
- [x] Không thêm dependency mới (dùng `dayjs` đã có)
- [x] Pure function, không side effect
- [x] Unit test coverage ≥ 90%

## Implementation Steps

1. [x] Tạo file `src/lib/utils/age.ts`
   ```typescript
   import dayjs from 'dayjs';
   
   const DOB_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;
   
   /**
    * Parse DD/MM/YYYY → dayjs object
    */
   function parseDob(dob: string): dayjs.Dayjs | null {
     if (!dob || !DOB_REGEX.test(dob)) return null;
     const [dd, mm, yyyy] = dob.split('/');
     const parsed = dayjs(`${yyyy}-${mm}-${dd}`);
     return parsed.isValid() ? parsed : null;
   }
   
   export type AgeUnit = 'day' | 'week' | 'month' | 'year';
   
   export interface AgeParts {
     value: number;
     unit: AgeUnit;
   }
   
   /**
    * Tính tuổi và trả về { value, unit }
    * Quy tắc:
    *   < 7 ngày        → unit: 'day'
    *   < 2 tháng       → unit: 'week'
    *   < 6 tuổi (72m)  → unit: 'month'
    *   ≥ 6 tuổi        → unit: 'year'
    */
   export function parseAgeParts(dob: string, referenceDate?: dayjs.Dayjs): AgeParts | null {
     const birth = parseDob(dob);
     if (!birth) return null;
     
     const now = referenceDate || dayjs();
     const diffDays = now.diff(birth, 'day');
     const diffWeeks = Math.floor(diffDays / 7);
     const diffMonths = now.diff(birth, 'month');
     const diffYears = now.diff(birth, 'year');
     
     if (diffDays < 7) {
       return { value: diffDays, unit: 'day' };
     }
     if (diffMonths < 2) {
       return { value: diffWeeks, unit: 'week' };
     }
     if (diffYears < 6) {
       return { value: diffMonths, unit: 'month' };
     }
     return { value: diffYears, unit: 'year' };
   }
   
   /**
    * Format tuổi thành chuỗi hiển thị tiếng Việt
    */
   export function formatAge(dob: string, referenceDate?: dayjs.Dayjs): string {
     const parts = parseAgeParts(dob, referenceDate);
     if (!parts) return '';
     
     switch (parts.unit) {
       case 'day':   return `${parts.value} ngày tuổi`;
       case 'week':  return `${parts.value} tuần tuổi`;
       case 'month': return `${parts.value} tháng tuổi`;
       case 'year':  return `${parts.value} tuổi`;
     }
   }
   ```

2. [x] Tạo file test `src/lib/utils/__tests__/age.test.ts`
   - Test < 7 ngày → hiển thị ngày
   - Test 7 ngày → hiển thị 1 tuần
   - Test 1.5 tháng → hiển thị tuần  
   - Test 2 tháng → hiển thị tháng
   - Test 5 tuổi 11 tháng → hiển thị tháng
   - Test 6 tuổi → hiển thị tuổi
   - Test 30 tuổi → hiển thị tuổi
   - Test DOB null/empty → return ''
   - Test DOB format cũ ("1990") → return ''
   - Test DOB invalid ("32/13/2000") → return ''
   - Test 0 ngày (newborn) → "0 ngày tuổi"

## Files to Create/Modify
- `src/lib/utils/age.ts` - **MỚI** - Utility functions
- `src/lib/utils/__tests__/age.test.ts` - **MỚI** - Unit tests

## Test Criteria
- [ ] `formatAge('23/04/2026')` với ngày hiện tại 23/04/2026 → `"0 ngày tuổi"`
- [ ] `formatAge('20/04/2026')` với ngày 23/04/2026 → `"3 ngày tuổi"`
- [ ] `formatAge('10/04/2026')` với ngày 23/04/2026 → `"1 tuần tuổi"`
- [ ] `formatAge('01/03/2026')` với ngày 23/04/2026 → `"7 tuần tuổi"`
- [ ] `formatAge('23/10/2025')` với ngày 23/04/2026 → `"6 tháng tuổi"`
- [ ] `formatAge('23/04/2021')` với ngày 23/04/2026 → `"5 tuổi"` ← WRONG, 60 tháng < 72 → `"60 tháng tuổi"`
- [ ] `formatAge('23/04/2020')` với ngày 23/04/2026 → `"6 tuổi"`
- [ ] `formatAge('')` → `""`
- [ ] `parseAgeParts('01/03/2026', dayjs('2026-04-23'))` → `{ value: 7, unit: 'week' }`

## Notes
- `referenceDate` param cho phép test deterministic (không phụ thuộc `Date.now()`)
- `parseAgeParts` export riêng để Phase 03 dùng cho `AgeGroupChart`
- DOB format `DD/MM/YYYY` cần parse thành `YYYY-MM-DD` trước khi đưa vào dayjs

---
Next Phase: [phase-02-integrate-ui.md](./phase-02-integrate-ui.md)
