# Phase 01: Core Fix — `parseDob()` + Unit Tests

Status: ✅ Completed
Dependencies: None

## Objective

Sửa `parseDob()` để hiểu cả 2 format: `DD/MM/YYYY` (input form) và `YYYY-MM-DD` (DB). Cập nhật unit tests.

## Implementation Steps

### 1. Sửa `parseDob()` trong `src/lib/utils/age.ts`

- [ ] Thêm regex cho `YYYY-MM-DD`: `/^\d{4}-\d{2}-\d{2}$/`
- [ ] Detect format tự động:
  - Nếu match `DD/MM/YYYY` → parse như hiện tại
  - Nếu match `YYYY-MM-DD` → parse `yyyy`, `mm`, `dd` tương ứng
- [ ] Giữ nguyên strict validation (check overflow date)

**Code change cụ thể:**

```typescript
// age.ts - parseDob()
const DOB_REGEX_DDMMYYYY = /^\d{2}\/\d{2}\/\d{4}$/;
const DOB_REGEX_ISO = /^\d{4}-\d{2}-\d{2}$/;

function parseDob(dob: string): dayjs.Dayjs | null {
  if (!dob) return null;

  let dd: string, mm: string, yyyy: string;

  if (DOB_REGEX_DDMMYYYY.test(dob)) {
    [dd, mm, yyyy] = dob.split('/');
  } else if (DOB_REGEX_ISO.test(dob)) {
    [yyyy, mm, dd] = dob.split('-');
  } else {
    return null;
  }

  // ... giữ nguyên logic validate phía dưới ...
}
```

### 2. Cập nhật unit tests `src/lib/utils/__tests__/age.test.ts`

- [ ] Thêm test group mới: `describe('YYYY-MM-DD format')`
- [ ] Test cases cần thêm:

```typescript
// ISO format tests
it('should parse ISO format (YYYY-MM-DD)', () => {
  expect(formatAge('2026-04-23', refDate)).toBe('0 ngày tuổi');
});

it('should parse ISO format for older patient', () => {
  expect(formatAge('1996-04-23', refDate)).toBe('30 tuổi');
});

it('should parse ISO format for infant', () => {
  expect(formatAge('2025-02-16', refDate)).toBe('14 tháng tuổi');
  // Đây chính là DOB của bệnh nhân Nguyễn Quang Hoàng Đức
});

it('should still reject invalid ISO dates', () => {
  expect(formatAge('2026-13-01')).toBe('');
  expect(formatAge('2026-01-32')).toBe('');
});
```

- [ ] Thêm test cho `parseAgeParts` với ISO format

### 3. Chạy tests

- [ ] `npx vitest run src/lib/utils/__tests__/age.test.ts`
- [ ] Đảm bảo tất cả tests cũ vẫn pass (không regression)
- [ ] Đảm bảo tests mới pass

## Files to Modify

| File | Action | Mô tả |
|------|--------|-------|
| `src/lib/utils/age.ts` | MODIFY | Sửa `parseDob()` hỗ trợ `YYYY-MM-DD` |
| `src/lib/utils/__tests__/age.test.ts` | MODIFY | Thêm test cases cho ISO format |

## Test Criteria

- [ ] `formatAge('2025-02-16')` trả kết quả tuổi đúng (không trả `''`)
- [ ] `formatAge('23/04/1996', refDate)` vẫn trả `'30 tuổi'` (backward compatible)
- [ ] `parseAgeParts('2025-02-16')` trả `{ value: X, unit: 'month' }` hợp lệ
- [ ] Invalid dates vẫn bị reject (`2026-13-01`, `abc`, `''`)
- [ ] Toàn bộ test suite pass: 0 failures

## Notes

- **KHÔNG sửa** `patientFormSchema.transform()` — giữ nguyên việc lưu `YYYY-MM-DD` vào DB vì đây là format chuẩn ISO.
- `AgeGroupChart` và tất cả component dùng `formatAge()`/`parseAgeParts()` sẽ tự động được fix sau khi sửa `parseDob()`.

---
Next Phase: [phase-02-fix-form-display.md](./phase-02-fix-form-display.md)
