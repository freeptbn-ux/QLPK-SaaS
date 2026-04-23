# Plan: Fix Prescribe Page Crash

**Created:** 2026-04-23T14:28:00+07:00
**Status:** 🟡 Chờ duyệt

---

## 🔍 Root Cause Analysis

### Lỗi gốc
```
⨯ Error: Functions cannot be passed directly to Client Components unless you
  explicitly expose it by marking it with "use server". Or maybe you meant to
  call this function rather than return it.
  <... component={function LinkComponent} href=... underline=... color=... children=...>
                   ^^^^^^^^^^^^^^^^^^^^^^^^
```

### Giải thích
Trang `/patients/[id]/prescribe/page.tsx` là **Server Component** (không có `'use client'`).
Trong file này, code dùng `<MuiLink component={Link}>` — truyền Next.js `Link` (một function component)
qua prop `component` của MUI `Link`. 

Next.js 16 **cấm** truyền function từ Server Component sang Client Component vì function không
thể serialize qua mạng. MUI `Link` là Client Component nên khi nhận prop `component={Link}`
(một function), React server ném lỗi serialization → error boundary bắt → hiện "Lỗi tải trang".

### Tại sao các trang khác không lỗi?
- `PatientList.tsx`, `PrescriptionHistory.tsx` đều có `'use client'` → chạy hoàn toàn trên client
  → pattern `component={Link}` hoạt động bình thường
- `not-found.tsx` cũng dùng pattern này nhưng nằm ở root level, có thể được render khác

### Bằng chứng
1. ✅ Build TypeScript thành công (không lỗi compile-time)
2. ✅ Reproduce trên dev server local: error log xác nhận
3. ✅ Reproduce trên Vercel production: user screenshot xác nhận
4. ✅ Lỗi xuất hiện **2 lần** vì có 2 `<MuiLink component={Link}>` trong Breadcrumbs

---

## 🛠️ Fix Strategy

Có 2 cách fix:
- **Option A:** Thêm `'use client'` vào page → ❌ Không tốt, mất SSR cho data fetching
- **Option B:** Thay đổi pattern Breadcrumbs để không truyền function → ✅ Recommended

**Chọn Option B:** Dùng `<Link>` thuần (Next.js) kết hợp với `<MuiLink>` bằng cách:
- Dùng `<Link href="..." passHref legacyBehavior>` bọc `<MuiLink>`
- Hoặc dùng `<Link>` trực tiếp với styling

---

## Phases

| Phase | Name | Status | Progress | Files |
|-------|------|--------|----------|-------|
| 01 | Fix Server Component serialization | ⬜ Pending | 0% | 1 file |
| 02 | Audit toàn bộ codebase | ⬜ Pending | 0% | ~2 files |
| 03 | Test & Deploy | ⬜ Pending | 0% | 0 files |

**Tổng:** 3 phases | Ước tính: 1 session

---

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
