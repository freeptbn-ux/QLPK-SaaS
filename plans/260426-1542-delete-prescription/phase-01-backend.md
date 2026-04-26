# Phase 01: Backend API & Database
Status: ✅ Completed
Dependencies: None

## Objective
Tạo Server Action và đảm bảo có thể xóa an toàn một đơn thuốc từ cơ sở dữ liệu, bao gồm cả thông tin Header và Details.

## Requirements
### Functional
- [x] Xóa toàn bộ bản ghi liên quan trong `prescriptions_detail` của đơn thuốc bị xóa.
- [x] Xóa bản ghi trong `prescriptions_header`.
- [x] Trả về kết quả (thành công/lỗi) để frontend xử lý.

### Non-Functional
- [x] Đảm bảo tính toàn vẹn dữ liệu (sử dụng Transaction hoặc RPC nếu cấu trúc DB không có ON DELETE CASCADE).
- [x] Kiểm tra quyền người dùng (nếu có yêu cầu bảo mật).
- [x] Revalidate lại cache của Next.js cho trang bệnh nhân.

## Implementation Steps
1. [x] Cập nhật/Tạo mới một Supabase RPC tên là `delete_prescription` (Tùy chọn, nếu bảng `prescriptions_detail` không được set `ON DELETE CASCADE` với `prescriptions_header`). Hoặc viết logic trực tiếp trong server action xóa tuần tự: xóa details -> xóa header.
2. [x] Thêm Server Action `deletePrescription(prescriptionId: number, patientId: number)` vào `src/actions/prescriptions.ts`.
3. [x] Xử lý try-catch và gọi `revalidatePath('/patients/${patientId}')`.

## Files to Create/Modify
- `src/actions/prescriptions.ts` - Thêm function `deletePrescription`.
- `supabase/migrations/XXX_add_delete_prescription_rpc.sql` (Nếu cần tạo RPC).

## Test Criteria
- [ ] Xóa thành công một đơn thuốc thì dữ liệu trong `prescriptions_header` biến mất.
- [ ] Dữ liệu trong `prescriptions_detail` liên quan cũng biến mất theo.
- [ ] Giao diện tự động cập nhật lại.

---
Next Phase: [Phase 02: Frontend UI](./phase-02-frontend.md)
