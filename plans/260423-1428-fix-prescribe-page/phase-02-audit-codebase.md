# Phase 02: Audit Codebase for Same Pattern

**Status:** ✅ Completed
**Dependencies:** Phase 01

---

## Objective

Quét toàn bộ codebase để tìm và fix các chỗ khác cũng dùng pattern `component={Link}` 
trong **Server Components** (tiềm ẩn lỗi tương tự).

## Audit Results (Pre-scan)

### Các file dùng pattern `component={Link}`:

| File | Line | Là Server Component? | Cần fix? |
|------|------|---------------------|----------|
| `src/app/(dashboard)/patients/[id]/prescribe/page.tsx` | 34, 37 | ✅ Có (no 'use client') | ✅ **Phase 01 đã fix** |
| `src/app/not-found.tsx` | 31 | ✅ Có (no 'use client') | ✅ **Fixed** |
| `src/components/features/patients/PatientList.tsx` | 147, 215 | ❌ Không ('use client') | ❌ An toàn |
| `src/components/features/patients/PrescriptionHistory.tsx` | 117, 148 | ❌ Không ('use client') | ❌ An toàn |

### Phát hiện tiềm ẩn:
- **`not-found.tsx`**: Đã fix bằng cách chuyển sang pattern `passHref legacyBehavior` và xóa `'use client'` để trở thành Server Component chuẩn.

## Implementation Steps

- [x] 1. Kiểm tra `src/app/not-found.tsx` — fix pattern `component={Link}` nếu cần
- [x] 2. Grep toàn bộ codebase: tìm thêm pattern tương tự trong các Server Components
      ```bash
      grep -rn "component={Link}" src/ --include="*.tsx" --include="*.ts"
      ```
- [x] 3. Kiểm tra chéo: mọi file KHÔNG có `'use client'` mà dùng pattern này → fix
- [x] 4. Tạo comment/convention trong codebase: "KHÔNG dùng component={Link} trong Server Components"

## Files to Check/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/app/not-found.tsx` | Check & Fix | Fix pattern nếu là Server Component |
| Any new Server Components | Audit | Đảm bảo không lặp lại |

## Test Criteria

- [x] Grep `component={Link}` trong Server Components trả về 0 kết quả
- [x] Trang `/not-found` vẫn hoạt động đúng (truy cập URL không tồn tại) - *Code verified, logic matches standard pattern*
- [x] Không có regression ở các trang khác

## Convention Rule (Phòng ngừa)

```
📏 RULE: Trong Server Components (không có 'use client'):
  ❌ KHÔNG: <MuiLink component={Link} href="...">
  ❌ KHÔNG: <Button component={Link} href="...">
  ❌ KHÔNG: <IconButton component={Link} href="...">
  
  ✅ ĐÚNG:  <Link href="..." passHref legacyBehavior><MuiLink>...</MuiLink></Link>
  ✅ ĐÚNG:  Chuyển component sang 'use client' nếu cần pattern component={Link}
```

---
**Next Phase:** [phase-03-test-deploy.md](./phase-03-test-deploy.md)
