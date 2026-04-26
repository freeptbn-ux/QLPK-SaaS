# Phase 03: Test & Deploy

**Status:** ⬜ Pending
**Dependencies:** Phase 01, Phase 02

---

## Objective

Kiểm tra fix hoạt động đúng trên local và deploy lên Vercel production.

## Implementation Steps

### 3.1 Local Testing

- [ ] 1. Chạy dev server: `npm run dev`
- [ ] 2. Login vào app
- [ ] 3. Truy cập `/patients/766/prescribe` → Kiểm tra trang load OK
- [ ] 4. Kiểm tra Breadcrumbs navigation hoạt động (click từng breadcrumb)
- [ ] 5. Kiểm tra form kê đơn:
      - Chẩn đoán hiển thị đúng
      - Autocomplete tìm thuốc hoạt động
      - Thêm/xóa thuốc hoạt động
      - Tính tiền đúng
- [ ] 6. Kiểm tra dev server console: KHÔNG có error log
- [ ] 7. Truy cập URL không tồn tại (VD: `/xyz`) → Kiểm tra not-found page

### 3.2 Build Verification

- [ ] 8. Chạy `npm run build` → Phải thành công
- [ ] 9. Kiểm tra không có warning mới

### 3.3 Deploy

- [ ] 10. Git commit: `fix: resolve prescribe page crash - Server Component serialization`
- [ ] 11. Git push → Vercel auto-deploy
- [ ] 12. Sau khi deploy xong, truy cập production: `https://qlpk-saa-s-kuus.vercel.app/patients/766/prescribe`
- [ ] 13. Xác nhận trang load OK trên production

## Test Criteria

- [ ] Trang `/patients/[id]/prescribe` hiển thị form kê đơn (không error boundary)
- [ ] Breadcrumbs click navigate đúng
- [ ] Form kê đơn hoạt động đầy đủ
- [ ] Build production thành công
- [ ] Vercel deploy thành công
- [ ] Production page load OK

## Rollback Plan

Nếu deploy thất bại:
```bash
git revert HEAD
git push
```

---
**✅ Plan complete after this phase!**
