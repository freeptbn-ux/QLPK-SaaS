# Phase 01: Cập nhật Test Script
Status: ✅ Complete
Dependencies: None

## Objective
Chỉnh sửa file script test `scripts/test-update-prescription.ts` để dữ liệu mẫu (mock data) được tạo ra khớp hoàn toàn với cấu trúc (schema) hiện tại của các bảng `patients` và `medicines` trên Supabase.

## Requirements
### Functional
- [x] Bệnh nhân mẫu (Test Patient) phải có trường `dob` (Date of Birth) và `gender` hợp lệ để đáp ứng điều kiện `NOT NULL` của database.
- [x] Thuốc mẫu (Test Medicine) không được truyền trường `unit`, do bảng `medicines` hiện tại chỉ sử dụng `packing_spec` (quy cách đóng gói) và không có cột `unit`.

### Non-Functional
- [x] Đảm bảo sau khi sửa, script chạy thành công mà không gặp lỗi liên quan đến Schema.

## Implementation Steps
1. [x] **Sửa lỗi insert Patient**: Mở file `scripts/test-update-prescription.ts`, thêm `dob: '1990-01-01'` và `gender: 'Nam'` vào tham số của câu lệnh `.insert()` vào bảng `patients`.
2. [x] **Sửa lỗi insert Medicine**: Xóa dòng `unit: 'Viên',` khỏi tham số của câu lệnh `.insert()` vào bảng `medicines`.
3. [x] **Chạy thử nghiệm nghiệm thu**: Chạy lệnh `npx -y tsx scripts/test-update-prescription.ts` để đảm bảo script đã chạy mượt mà từ đầu đến cuối và báo cáo "✅ Xong!".

## Files to Modify
- `scripts/test-update-prescription.ts` - Loại bỏ `unit` và thêm `dob` vào các câu lệnh tạo data test.

## Test Criteria
- [ ] Lệnh `npx -y tsx scripts/test-update-prescription.ts` không còn văng lỗi `PGRST204` (thiếu cột) và `23502` (vi phạm not-null).
- [ ] Cập nhật thành công số lượng thuốc và các bản ghi liên quan trong test script.

---
Next Phase: N/A (Hoàn thành kế hoạch)
