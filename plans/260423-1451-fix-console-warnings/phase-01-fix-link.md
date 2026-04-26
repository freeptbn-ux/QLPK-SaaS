# Phase 01: Fix Link Deprecation (Next.js 16)

Status: ✅ Complete
Dependencies: None

## Objective
Loại bỏ cảnh báo deprecation của `legacyBehavior` trong `next/link`. 
Với Next.js 16, `legacyBehavior` đã bị deprecated. Pattern chuẩn:
- KHÔNG dùng `legacyBehavior` hay `passHref`.
- `Link` từ `next/link` tự render `<a>`, nên child MUI phải dùng `component="span"` để tránh nested `<a>`.

## Changes Made
- [x] `src/app/(dashboard)/patients/[id]/prescribe/page.tsx`: Xóa `passHref legacyBehavior`, thêm `component="span"` cho `MuiLink`.
- [x] `src/app/not-found.tsx`: Xóa `passHref legacyBehavior`, đổi `Button component="a"` → `component="span"`.
- [x] `src/app/not-found.tsx`: Cleanup unused `MuiLink` import.

## Pattern Áp Dụng

**Trước (deprecated):**
```tsx
<Link href="/path" passHref legacyBehavior>
  <MuiLink underline="hover">Text</MuiLink>
</Link>
```

**Sau (Next.js 16 chuẩn):**
```tsx
<Link href="/path" style={{ textDecoration: 'none' }}>
  <MuiLink component="span" underline="hover">Text</MuiLink>
</Link>
```

## Test Criteria
- [x] Console không còn log cảnh báo deprecation của `legacyBehavior`.
- [x] Các link vẫn hoạt động đúng (click chuyển trang).
- [x] `grep legacyBehavior src/` = 0 results.

---
Next Phase: [phase-02-fix-autocomplete.md](./phase-02-fix-autocomplete.md)
