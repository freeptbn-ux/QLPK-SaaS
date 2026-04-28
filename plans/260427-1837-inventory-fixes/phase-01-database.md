# Phase 01: Database & RPC
Status: ✅ Completed
Dependencies: None

## Objective
Khởi tạo cấu trúc bảng để lưu trữ lịch sử cập nhật kho và viết hàm RPC (Stored Procedure) để đảm bảo tính nguyên tử (atomic) khi cập nhật số lượng tồn kho. Giải quyết dứt điểm vấn đề Race Condition và chuẩn hoá Business Rule về số âm.

## Requirements
### Functional
- [x] Tạo bảng `inventory_transaction_logs` để lưu lịch sử.
- [x] Viết hàm RPC `adjust_medicine_stock` thực hiện cập nhật `medicines` và chèn log vào `inventory_transaction_logs` trong cùng 1 transaction.
- [x] Rà soát, thêm ràng buộc `CHECK (stock_quantity >= 0)` (nếu thống nhất không cho phép tồn âm) hoặc giữ nguyên dựa vào quy định của App. Sẽ cần xác nhận với người dùng về luật này. (Đề xuất: Chặn số âm ở database).

### Non-Functional
- [x] Security: Giới hạn quyền thực thi RPC cho role được phép.
- [x] Data Integrity: ACID properties khi thực hiện log và update.

## Implementation Steps
1. [x] Cập nhật database script hoặc tạo file SQL migration cho:
   - Bảng `inventory_transaction_logs` với các cột: `id`, `medicine_id`, `user_id` (nếu có user/auth table), `old_quantity`, `new_quantity`, `adjustment`, `reason`, `created_at`.
   - Hàm `adjust_medicine_stock(p_medicine_id BIGINT, p_adjustment INTEGER, p_reason TEXT)`.
2. [x] Áp dụng vào cơ sở dữ liệu (chạy SQL query trên môi trường dev).

## Files to Create/Modify
- `database/migrations/xxx_add_inventory_logs.sql` (hoặc file lưu kịch bản SQL migration tương đương).
- Cập nhật types cho database.

---
Next Phase: [Phase 02: Backend Actions](./phase-02-backend.md)
