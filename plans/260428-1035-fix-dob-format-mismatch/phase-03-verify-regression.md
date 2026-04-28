# Phase 03: Verify & Regression Test

Status: ✅ Complete
Dependencies: Phase 01, Phase 02

## Objective

Chạy toàn bộ test suite, verify trên browser, đảm bảo không regression.

## Implementation Steps

### 1. Chạy unit tests

- [x] `npx vitest run src/lib/utils/__tests__/age.test.ts` — tests mới + cũ đều pass
- [x] `npx vitest run src/lib/validations/__tests__/patient.test.ts` — validation vẫn OK
- [x] `npx vitest run` — toàn bộ test suite pass (ngoại trừ các lỗi mocking auth vốn có)

### 2. Verify trên browser (manual)

- [x] Mở `/patients` → Kiểm tra danh sách hiện tuổi đúng (không trống)
- [x] Mở `/patients/788` (Nguyễn Quang Hoàng Đức):
  - DOB hiện `16/02/2025`
  - Tuổi hiện `(14 tháng tuổi)` hoặc tương tự (tùy ngày test)
- [x] Click "Chỉnh sửa" bệnh nhân:
  - Form DOB pre-fill `16/02/2025` (không trống, không cảnh báo format cũ)
  - Lưu lại → không lỗi
- [x] Mở `/patients/788/prescribe`:
  - Panel bệnh nhân hiện `Nam · 14 tháng tuổi` (không hiện "Không rõ tuổi")
- [x] Mở `/statistics` → Biểu đồ nhóm tuổi hiện đúng phân bố

### 3. Edge cases kiểm tra

- [x] Tạo bệnh nhân mới với DOB `DD/MM/YYYY` → lưu OK, hiển thị tuổi đúng
- [x] Bệnh nhân DOB trống → hiện "N/A" hoặc "Không rõ tuổi" (expected behavior)
- [x] Bệnh nhân DOB legacy format (VD: `5 tuổi`, `13 tháng`) → hiện cảnh báo format cũ khi edit

## Checklist hoàn thành

- [x] Tất cả unit tests pass
- [x] Bệnh nhân Nguyễn Quang Hoàng Đức hiện tuổi đúng trên mọi trang
- [x] Không regression: bệnh nhân khác vẫn hiện đúng
- [x] Biểu đồ thống kê tuổi hoạt động đúng

## Sau khi hoàn thành

- Cập nhật status trong `plan.md` → ✅ Complete
- Có thể xóa hoặc archive `ngaythang.md`
