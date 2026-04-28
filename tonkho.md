# Báo cáo Phân tích Lỗi Logic: Luồng Điều chỉnh Tồn kho

Báo cáo này phân tích các lỗi logic trong tính năng "Điều chỉnh tồn kho" tại trang Quản lý thuốc (`/medicines`).

## 1. Lỗi Race Condition (Cạnh tranh dữ liệu)

### Chi tiết lỗi:
Hiện tại, việc tính toán số lượng tồn kho mới đang được thực hiện ở phía Client (Frontend) trước khi gửi lên Server.
- **File:** `src/components/features/medicines/StockAdjustDialog.tsx`
- **Dòng code:** 
  ```typescript
  const newQuantity = medicine.stock_quantity + adjustment;
  await updateMedicineStock(medicine.id, newQuantity);
  ```
- **Kịch bản lỗi:** 
  1. Người dùng A mở form điều chỉnh (tồn hiện tại là 100).
  2. Trong lúc người dùng A đang nhập số lượng cộng thêm 50, một đơn thuốc được tạo làm tồn giảm xuống còn 80.
  3. Người dùng A bấm "Cập nhật". Frontend gửi số `150` (100 + 50) lên server.
  4. Server ghi đè số `150` vào database.
- **Hậu quả:** 20 đơn vị thuốc vừa bán bị "biến mất" khỏi hệ thống, dữ liệu tồn kho bị sai lệch hoàn toàn.

### Cách Fix:
- **Frontend:** Không tính toán `newQuantity`. Chỉ gửi ID thuốc và giá trị thay đổi (`adjustment`) lên Server.
- **Backend:** Thực hiện phép tính trực tiếp trong câu lệnh SQL để đảm bảo tính nguyên tử (Atomicity).

---

## 2. Cập nhật không nguyên tử (Non-atomic Update)

### Chi tiết lỗi:
Server Action nhận vào một con số tuyệt đối và ghi đè nó vào Database.
- **File:** `src/actions/medicines.ts`
- **Hàm:** `updateMedicineStock(id, newQuantity)`
- **Dòng code:** `.update({ stock_quantity: newQuantity })`
- **Vấn đề:** Câu lệnh `UPDATE ... SET stock_quantity = ?` không bảo vệ được dữ liệu nếu có nhiều tiến trình cùng truy cập.

### Cách Fix:
Sử dụng tính năng tăng/giảm giá trị của Postgres hoặc viết một hàm RPC trong Supabase:
```sql
-- Viết RPC để cập nhật an toàn
CREATE OR REPLACE FUNCTION adjust_medicine_stock(medicine_id BIGINT, adjustment_amount INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE medicines
    SET stock_quantity = stock_quantity + adjustment_amount
    WHERE id = medicine_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 3. Mâu thuẫn Quy tắc Nghiệp vụ (Business Rule Inconsistency)

### Chi tiết lỗi:
Có sự không thống nhất giữa định nghĩa Schema và kiểm tra ở UI.
- **Schema (`src/lib/validations/medicine.ts`):** Ghi chú cho phép số âm.
- **UI (`StockAdjustDialog.tsx`):** Chặn không cho số lượng mới < 0.
- **Hậu quả:** Gây bối rối cho lập trình viên bảo trì và có thể dẫn đến lỗi Runtime nếu logic nghiệp vụ thực tế yêu cầu khác.

### Cách Fix:
- Thống nhất quy tắc tại file `validations/medicine.ts`.
- Nếu không cho phép tồn âm, hãy thêm `CHECK (stock_quantity >= 0)` trực tiếp vào database để đảm bảo tính toàn vẹn dữ liệu ở mức thấp nhất.

---

## 4. Thiếu Nhật ký Kho (Audit/Inventory Logs)

### Chi tiết lỗi:
Hệ thống hiện tại chỉ thay đổi số lượng mà không lưu lại lý do hoặc lịch sử.
- **Vấn đề:** Không thể truy cứu tại sao kho bị hụt, ai là người nhập hàng, hoặc phát hiện gian lận.

### Cách Fix:
- Tạo bảng `inventory_transaction_logs` để lưu: `medicine_id`, `user_id`, `old_quantity`, `new_quantity`, `reason` (Nhập hàng, Hư hỏng, Kiểm kê...), `created_at`.
- Thực hiện việc cập nhật tồn kho và lưu log trong một **Database Transaction** duy nhất.

---

## 5. Thiếu Validation ở Server-side

### Chi tiết lỗi:
Hàm `updateMedicineStock` nhận tham số trực tiếp mà không qua kiểm tra Zod Schema.
- **Vấn đề:** Một người dùng có kiến thức kỹ thuật có thể gọi Server Action này trực tiếp từ Console để set tồn kho thành bất kỳ số nào (thậm chí là số âm rất lớn hoặc số không hợp lệ).

### Cách Fix:
Sử dụng Zod để validate input ngay đầu hàm Server Action tương tự như cách làm ở hàm `addMedicine` và `updateMedicine`.
