# Phase 01: Validation & Frontend
Status: ✅ Done
Dependencies: None

## Objective
Cập nhật Zod schema và giao diện form để bắt buộc người dùng nhập Ngày sinh, Giới tính, và Số điện thoại khi tạo/cập nhật bệnh nhân.

## Requirements
### Functional
- [x] Zod schema: `dob`, `gender`, `phone` không được để trống (bỏ `.optional()` và thêm validate chiều dài).
- [x] Giao diện form: Thêm dấu `*` đỏ vào các label tương ứng để báo hiệu bắt buộc.
- [x] Hiển thị thông báo lỗi rõ ràng trên form khi người dùng bỏ trống các trường này.

## Implementation Steps
1. [x] Sửa file `src/lib/validations/patient.ts`:
   - Cập nhật `dob`: Thêm `.min(1, 'Ngày sinh không được để trống')`.
   - Cập nhật `gender`: Cập nhật lại enum không chứa chuỗi rỗng `''`.
   - Cập nhật `phone`: Thêm `.min(1, 'Số điện thoại không được để trống')`.
2. [x] Sửa file `src/components/features/patients/PatientFormDialog.tsx`:
   - Thêm `<span className="text-red-500">*</span>` vào label của `dob`, `gender`, `phone`.
   - Bổ sung hiển thị lỗi (error message) cho `phone` nếu có lỗi từ Zod (hiện tại `DateInput` đã có).
3. [x] Kiểm tra lại logic validation và submit trên giao diện.

## Files to Create/Modify
- `src/lib/validations/patient.ts` - Cập nhật schema validation.
- `src/components/features/patients/PatientFormDialog.tsx` - Cập nhật UI.

## Test Criteria
- [x] Nhấn "Lưu" khi form trống -> Báo lỗi ở cả 4 trường (Tên, Ngày sinh, Giới tính, SĐT).
- [x] Form submit thành công khi nhập đủ 4 trường bắt buộc.

---
Next Phase: phase-02-database.md
