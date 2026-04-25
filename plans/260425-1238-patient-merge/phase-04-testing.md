# Phase 04: Testing & Verification
Status: ⬜ Pending
Dependencies: Phase 03

## Objective
Kiểm tra tính năng gộp hồ sơ từ đầu đến cuối (End-to-End Test), đảm bảo tính toàn vẹn dữ liệu.

## Requirements
### Functional
- [ ] Tạo tay data giả (Mock data): Thêm 2-3 bệnh nhân có cùng Tên, DOB, Số điện thoại.
- [ ] Tạo cho mỗi bệnh nhân 1 lịch sử đơn thuốc.
- [ ] Mở Dialog quét, chọn 1 người làm Master, và bấm Gộp.
- [ ] Vào màn hình chi tiết bệnh nhân (Master) kiểm tra.

## Implementation Steps
1. [ ] Mở Web app, vào mục Bệnh nhân, dùng nút Thêm mới để test.
2. [ ] Vào Kê đơn để kê thử cho các ID trùng lặp.
3. [ ] Test tính năng "Dọn dẹp hồ sơ".
4. [ ] Query trực tiếp database hoặc giao diện để xác nhận `prescriptions` đã dồn về 1 mối và các ID dư thừa đã bị DELETE.

## Test Criteria
- [ ] Giao diện hiển thị đúng Tên gốc, tổng số Đơn thuốc = đơn của (A) + (B) + (C).
- [ ] Các record của B, C bị xoá hoàn toàn khỏi DB `patients`.
- [ ] Check DB Supabase: `prescriptions_header` không bị mất (count không đổi).
