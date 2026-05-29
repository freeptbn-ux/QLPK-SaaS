# Phase 02: Data Integrity & History Preservation
Status: ⬜ Pending
Dependencies: Phase 01

## Objective
Gia cố tính chính xác của dữ liệu: đảm bảo đơn thuốc luôn được tạo đầy đủ (hoặc không tạo gì nếu lỗi) và giữ lại toàn bộ lịch sử khám bệnh của bệnh nhân.

## Requirements
### Functional
- [ ] Chuyển logic cập nhật cân nặng bệnh nhân vào trong hàm SQL tạo đơn thuốc để chạy đồng thời (Atomic Transaction).
- [ ] Chuyển đổi `medical_history` từ một ô văn bản sang một bảng riêng biệt `patient_history_logs` để quản lý theo dòng thời gian.

### Data Integrity
- [ ] Nếu một bước trong quá trình tạo đơn thuốc lỗi, toàn bộ quá trình phải Rollback (thu hồi).
- [ ] Đảm bảo tính toàn vẹn của lịch sử y tế: Mỗi lần khám là một bản ghi riêng biệt, không thể bị ghi đè.

## Implementation Steps
1. [ ] **Unify Prescription RPC**: Sửa hàm `create_prescription` trong PostgreSQL để nhận thêm tham số `p_weight` và thực hiện `UPDATE patients` ngay bên trong hàm.
2. [ ] **Create History Table**: Tạo bảng `patient_history_logs` (patient_id, clinic_id, diagnosis, details_json, created_at).
3. [ ] **Migrate History Logic**: Cập nhật RPC để `INSERT` vào bảng lịch sử này mỗi khi tạo đơn thuốc thay vì update vào bảng `patients`.
3. [ ] **Update Frontend Action**: Chỉnh sửa `src/actions/prescriptions.ts` để gọi hàm RPC mới (đã gộp) và xóa lệnh update cân nặng riêng lẻ.

## Files to Create/Modify
- `supabase/migrations/20260510_unify_prescription_transaction.sql` - Hàm RPC gộp.
- `src/actions/prescriptions.ts` - Gọi RPC mới.
- `src/actions/patients.ts` - Kiểm tra logic tìm kiếm/hiển thị lịch sử.

## Test Criteria
- [ ] Tạo đơn thuốc -> Ngắt mạng giữa chừng hoặc giả lập lỗi -> Kiểm tra kho thuốc không bị trừ "oan".
- [ ] Khám cho 1 bệnh nhân 3 lần -> Lịch sử y tế phải hiện đủ 3 dòng thông tin khác nhau.

---
Next Phase: [Phase 03: Audit & Compliance](./phase-03-audit-compliance.md)
