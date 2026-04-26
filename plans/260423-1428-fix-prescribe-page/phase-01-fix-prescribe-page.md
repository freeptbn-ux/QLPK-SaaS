# Phase 01: Fix Server Component Serialization Error

**Status:** ✅ Completed
**Dependencies:** None

---

## Objective

Sửa lỗi trang `/patients/[id]/prescribe` crash do truyền function (Next.js `Link` component)
qua prop `component` của MUI `Link` trong Server Component.

## Root Cause

```
File: src/app/(dashboard)/patients/[id]/prescribe/page.tsx (Server Component)

Dòng 34: <MuiLink component={Link} href="/patients" ...>     ← LỖI
Dòng 37: <MuiLink component={Link} href={`/patients/${patientId}`} ...>  ← LỖI
```

Cả 2 dòng đều truyền `Link` (function) vào prop `component` → Next.js 16 không serialize được
→ crash toàn trang.

## Solution

Thay pattern `<MuiLink component={Link}>` bằng `<Link>` thuần bọc trong `<MuiLink>`:

### Before (lỗi):
```tsx
<MuiLink component={Link} href="/patients" underline="hover" color="inherit">
  Bệnh nhân
</MuiLink>
```

### After (fix):
```tsx
<Link href="/patients" passHref legacyBehavior>
  <MuiLink underline="hover" color="inherit">
    Bệnh nhân
  </MuiLink>
</Link>
```

**Giải thích:** 
- `Link` (Next.js) xử lý navigation phía server → an toàn trong Server Component
- `MuiLink` chỉ nhận string props (underline, color) → serialize được
- `passHref legacyBehavior` để Next.js Link truyền `href` xuống child `<a>` tag mà MuiLink render

## Implementation Steps

- [x] 1. Mở file `src/app/(dashboard)/patients/[id]/prescribe/page.tsx`
- [x] 2. Thay đổi dòng 34: Breadcrumb link "Bệnh nhân"
- [x] 3. Thay đổi dòng 37: Breadcrumb link tên bệnh nhân  
- [x] 4. Xóa import `Link as MuiLink` khỏi MUI imports (nếu không dùng nữa) hoặc giữ lại nếu vẫn cần

## Files to Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/app/(dashboard)/patients/[id]/prescribe/page.tsx` | Modify | Fix 2 Breadcrumb links |

## Test Criteria

- [x] Trang `/patients/[id]/prescribe` load thành công (không error boundary)
- [x] Breadcrumbs hiển thị đúng: "Bệnh nhân > Tên BN > Kê đơn thuốc"
- [x] Click breadcrumb "Bệnh nhân" → navigate về `/patients`
- [x] Click breadcrumb tên BN → navigate về `/patients/[id]`
- [x] PrescriptionForm render đúng (thông tin BN, form kê đơn)
- [x] Dev server không có error log liên quan

## Notes

- **KHÔNG** thêm `'use client'` vào page.tsx — cần giữ Server Component để data fetching hoạt động
- Pattern `passHref legacyBehavior` là cách chính thức của Next.js để kết hợp với MUI components trong Server Components

---
**Next Phase:** [phase-02-audit-codebase.md](./phase-02-audit-codebase.md)
