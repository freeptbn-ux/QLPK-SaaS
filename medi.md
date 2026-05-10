# Báo cáo Phân tích Lỗi Logic - Trang Medicines (/medicines)

**Dự án:** QLPK-SaaS
**Ngày phân tích:** 11/05/2026
**Phạm vi:** Logic nghiệp vụ, Multi-tenancy, Toàn vẹn dữ liệu và Hiệu năng.

---

## 1. Danh sách Lỗi Logic Nghiêm trọng

### 🔴 Lỗi 1: Xung đột tên thuốc toàn hệ thống (Multi-tenancy Violation)
*   **Vị trí:** `supabase/migrations/001_initial_schema.sql` (Line 33)
*   **Mô tả:** Bảng `medicines` có ràng buộc `UNIQUE(name)` toàn cục.
*   **Hệ quả:** Trong mô hình SaaS, nếu Phòng khám A đã thêm thuốc "Paracetamol", Phòng khám B sẽ **không thể** thêm thuốc cùng tên này. Đây là lỗi thiết kế "chết người" cho hệ thống đa khách hàng.
*   **Khuyến nghị:** Đổi thành `UNIQUE(name, clinic_id)`.

### 🔴 Lỗi 2: Rò rỉ dữ liệu sang Clinic mặc định (Data Leakage)
*   **Vị trí:** `supabase/migrations/20260427181500_rls_redesign.sql`
*   **Mô tả:** Cột `clinic_id` mặc định là `1`. Trigger tự động gán `clinic_id` cũng trả về `1` nếu không xác định được User Profile.
*   **Hệ quả:** Nếu hệ thống gặp lỗi phiên đăng nhập hoặc User chưa có profile, dữ liệu thuốc mới sẽ bị "đẩy" vào Phòng khám 1 (Mặc định). Các phòng khám khác có thể vô tình thấy hoặc bị trộn lẫn dữ liệu.
*   **Khuyến nghị:** Xóa giá trị mặc định `1`, bắt buộc có `clinic_id` hợp lệ hoặc báo lỗi (RAISE EXCEPTION).

---

## 2. Lỗi Toàn vẹn Dữ liệu & Tài chính

### 🟠 Lỗi 3: Sai số tài chính do kiểu dữ liệu REAL (Precision Loss)
*   **Vị trí:** `medicines.price`, `prescriptions_header.total_amount`.
*   **Mô tả:** Sử dụng kiểu `REAL` (floating point) để lưu giá tiền.
*   **Hệ quả:** Các phép tính nhân số lượng x đơn giá sẽ bị sai lệch phần thập phân (ví dụ: 19.99 * 10 có thể thành 199.900001). Khi tổng hợp báo cáo doanh thu hàng tháng, con số sẽ không khớp với kế toán thực tế.
*   **Khuyến nghị:** Chuyển sang kiểu `NUMERIC(12,2)`.

### 🟠 Lỗi 4: Cập nhật tồn kho không nguyên tử (Race Condition)
*   **Vị trí:** `update_prescription` RPC.
*   **Mô tả:** Việc hoàn kho (restore stock) và trừ kho mới diễn ra qua nhiều lệnh `UPDATE` riêng lẻ.
*   **Hệ quả:** Nếu có 2 bác sĩ cùng chỉnh sửa đơn thuốc hoặc tạo đơn mới cùng lúc cho cùng một loại thuốc, số lượng tồn kho cuối cùng sẽ bị sai lệch (Lost Update).
*   **Khuyến nghị:** Sử dụng `SELECT FOR UPDATE` để khóa hàng (row-level lock) trước khi tính toán lại tồn kho.

---

## 3. Lỗi Hiệu năng & Bảo mật

### 🟡 Lỗi 5: Cơ chế Fallback lọc thuốc tại Client (Performance Risk)
*   **Vị trí:** `src/actions/medicines.ts` - Hàm `getLowStockMedicines` (Line 150).
*   **Mô tả:** Nếu RPC lấy thuốc sắp hết kho bị lỗi, code sẽ tải **TOÀN BỘ** danh mục thuốc về và lọc bằng Javascript (`.filter()`).
*   **Hệ quả:** Với phòng khám có danh mục hàng ngàn thuốc, việc này gây nghẽn mạng và treo ứng dụng (High Memory Usage).
*   **Khuyến nghị:** Sử dụng các toán đồ lọc trực tiếp của Supabase (`.lte('stock_quantity', 'min_stock_level')`) thay vì fetch all.

### 🟡 Lỗi 6: Kiểm tra sử dụng thuốc thiếu Tenant context
*   **Vị trí:** `src/actions/medicines.ts` - Hàm `isMedicineInUse`.
*   **Mô tả:** Truy vấn kiểm tra thuốc có trong đơn thuốc nào không mà không kèm `clinic_id`.
*   **Hệ quả:** Dù ID là duy nhất, nhưng việc viết query thiếu context phòng khám là tiền đề cho các lỗi logic bảo mật sau này khi mở rộng hệ thống.

---

## 4. Tổng kết đánh giá
Trang `/medicines` hiện tại chỉ hoạt động ổn định ở quy mô nhỏ (Single-tenant). Để vận hành theo mô hình **SaaS chuyên nghiệp**, cần ưu tiên sửa đổi cấu trúc Database (UNIQUE constraint) và kiểu dữ liệu tài chính (NUMERIC) ngay lập tức.
