# Phase 01: Script Development
Status: ✅ Done
Dependencies: None

## Objective
Viết script Python `scripts/cleanup_duplicates.py` kết nối với Supabase, quét các đơn thuốc và xác định chính xác các đơn bị lặp cần xóa.

## Requirements
### Functional
- [x] Connect đến Supabase bằng Service Role Key (như tool migrate trước đó).
- [x] Lấy danh sách toàn bộ `prescriptions_header`.
- [x] Group dữ liệu theo: `patient_id`, ngày khám (cắt lấy phần YYYY-MM-DD), `diagnosis`.
- [x] Đối với mỗi nhóm có > 1 đơn thuốc: Lấy thông tin `prescription_details` để so sánh xem có thực sự trùng thuốc hoàn toàn không.
- [x] Nếu trùng thuốc hoàn toàn: Giữ lại 1 đơn thuốc (ví dụ đơn có ID nhỏ nhất), đánh dấu các đơn còn lại là "CẦN XÓA".
- [x] Mặc định chạy script sẽ là `--dry-run` (chỉ in ra console chứ KHÔNG XÓA thật).

### Non-Functional
- [x] Safety: Tránh xóa nhầm bằng cách match chính xác danh sách thuốc (`medicine_id`, `quantity`, `unit_price`).

## Implementation Steps
1. [x] Tạo file `scripts/cleanup_duplicates.py`.
2. [x] Viết hàm lấy data `prescriptions_header` và group dữ liệu.
3. [x] Viết hàm lấy và so sánh `prescription_details`.
4. [x] Viết logic in ra báo cáo các đơn bị lặp.
5. [x] Viết logic xóa (Supabase `delete()`) chạy khi có cờ `--execute`.

## Files to Create/Modify
- `scripts/cleanup_duplicates.py` - [Đã tạo] Script quét và xóa lặp.

## Test Criteria
- [x] Script chạy không báo lỗi cú pháp.
- [x] Kết nối được Supabase và in ra các group duplicate.

---
Next Phase: phase-02-testing.md
