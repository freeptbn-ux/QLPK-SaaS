# 💡 BRIEF: Tính Năng Nhập Thuốc Từ Excel & Khớp Tên Thông Minh (Kho Thuốc)

**Dự án:** QLPK-SaaS  
**Ngày tạo:** 04/11/2026  
**Module:** Quản lý Kho thuốc (`/medicines`)  
**Tài liệu liên quan:** `Danh_sach_thuoc.xlsx`, `audit.11.2026.md`

---

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT

Khi phòng khám nhập lô thuốc mới từ nhà cung cấp/nhà phân phối dược, danh sách thuốc thường được xuất ra dưới dạng file bảng tính Excel (`.xlsx` hoặc `.csv`). Hiện tại, thủ kho hoặc bác sĩ phải vào từng thuốc để bấm chỉnh số lượng tồn kho thủ công bằng nút "Cập nhật tồn kho", rất tốn thời gian và dễ nhầm lẫn.

Tuy nhiên, rào cản lớn nhất khi xây dựng tính năng "Nhập thuốc từ Excel" là:
1. **Tên thuốc không bao giờ khớp 100%:**
   - File Excel nhà cung cấp ghi: `Thuốc Xịt Mũi Aladka 15ml`, kho ghi: `Aladka`.
   - File Excel ghi: `Agimol 325`, kho ghi: `Paracetamol 325mg Agimol`.
   - File Excel ghi: `Atersin (Chai 60ml)`, kho ghi: `ATErsin` (dung tích để trong cột `packing_spec`).
   - File Excel ghi: `Oran-C`, kho ghi: `Oran C` (lệch dấu gạch nối, khoảng trắng, hoa/thường).
2. **Nguy cơ nhầm lẫn thuốc (LASA - Look-Alike Sound-Alike):**
   - Nếu để hệ thống tự động so sánh chuỗi lỏng lẻo rồi tự ý cộng kho, có thể cộng nhầm vào thuốc khác hoặc nhầm hàm lượng (ví dụ: `Augbactam 281,25mg` nhầm sang `Augbactam 562,5mg`).
3. **Mỗi lần nhập lại phải chọn lại từ đầu:**
   - Nếu không có cơ chế "ghi nhớ", mỗi tuần nhập cùng một file Excel từ nhà cung cấp quen thuộc, người dùng lại phải ngồi chọn ghép thủ công từ đầu.

---

## 2. GIẢI PHÁP ĐỀ XUẤT (THE SOLUTION)

Xây dựng luồng **"Nhập thuốc từ Excel"** với 3 trụ cột chính:

### 2.1. Quy tắc cộng tồn kho an toàn & tập trung
* **Quy tắc tính tồn:** Chỉ cộng dồn thêm vào kho (`Tồn mới = Tồn hiện tại + Số lượng trong Excel`). Không ghi đè hay xóa tồn hiện tại.
* **Phạm vi cập nhật:** Chỉ tác động vào số lượng tồn kho (`stock_quantity`) và ghi vết giao dịch (`inventory_transaction_logs`). Giữ nguyên đơn giá và quy cách hiện tại trong hệ thống.

### 2.2. Bộ máy So khớp Đa tầng (Regex Normalization + Fuzzy Trigram + Alias Memory)
Ưu tiên giải thuật xử lý chuỗi y tế nhanh, chính xác kết hợp trí nhớ lịch sử:
1. **Tầng 1 (Exact Match):** So khớp chính xác 100% theo tên hoặc mã định danh.
2. **Tầng 2 (Bảng nhớ Ánh xạ - `medicine_aliases`):** Tự động nhận diện ngay lập tức nếu tên thuốc trong file Excel đã từng được người dùng ghép thủ công ở các lần nhập trước.
3. **Tầng 3 (Chuẩn hóa từ ngữ Dược - Pharma Normalization):**
   - Loại bỏ dấu tiếng Việt (`unaccent`), chuyển chữ thường.
   - Loại bỏ các từ thừa phổ biến trong ngành dược: `thuốc`, `thuốc xịt mũi`, `siro`, `viên`, `hộp`, `chai`, `lọ`, `dạng ống`.
   - Tách và bảo toàn giá trị hàm lượng/thể tích (ví dụ: `325`, `250mg`, `60ml`) để ngăn ngừa ghép nhầm liều lượng.
4. **Tầng 4 (Fuzzy String Similarity):** Tính độ tương đồng bằng Trigram Similarity / Levenshtein Token Overlap để tìm ra thuốc có độ giống cao nhất trong kho.

### 2.3. Giao diện Duyệt Phân luồng 3 Màu (Human-in-the-Loop Review Table)
Không tự động cập nhật ngầm. Hệ thống hiển thị bảng duyệt trước trực quan:
* 🟢 **Đã khớp chắc chắn (Exact / Đã có trong Alias / Độ tin cậy ≥ 85%):** Hệ thống ghép sẵn, tự động tick chọn.
* 🟡 **Cần xác nhận (Gợi ý gần đúng):** Hiển thị ô tìm kiếm/chọn nhanh thuốc trong kho với gợi ý top 3 thuốc tương đồng nhất.
* 🔴 **Chưa có trong kho:** Cho phép người dùng hoặc gán vào một thuốc có sẵn, hoặc tick chọn **"Tạo thuốc mới"** vào kho ngay từ file Excel.
* **Lưu nhớ tức thì:** Mọi lựa chọn ghép thủ công của người dùng sẽ được tự động lưu vào bảng `medicine_aliases` của phòng khám (`clinic_id`) để các lần sau nhận diện tự động 100%.

---

## 3. ĐỐI TƯỢNG SỬ DỤNG
- **Người dùng chính:** Thủ kho, Bác sĩ, Nhân viên phòng khám phụ trách nhập vật tư/thuốc.
- **Môi trường:** Trình duyệt web (máy tính phòng khám), thao tác kéo thả file Excel từ nhà cung cấp.

---

## 4. TÍNH NĂNG (FEATURE BREAKDOWN)

### 🚀 MVP (Bắt buộc có):
1. **Nút "Nhập thuốc" tại trang `/medicines`:** Nằm cạnh nút "Thêm thuốc" trên thanh công cụ kho thuốc.
2. **Modal Upload File Excel:**
   - Hỗ trợ định dạng `.xlsx`, `.xls`, `.csv`.
   - Tự động nhận diện các cột phổ biến (`Tên thuốc`, `Số lượng`, `Quy cách`, `Thương hiệu`).
3. **Engine So khớp Tên thuốc (Pharma Normalization + Fuzzy Matching):**
   - Chạy client-side nhanh < 50ms cho danh mục 200-500 thuốc.
   - Bắt chuẩn các case: bỏ dấu, bỏ tiền tố/hậu tố ("Thuốc xịt mũi", "Chai 60ml", "dạng ống").
4. **Bảng Duyệt So khớp (Reconciliation Table):**
   - Cột so sánh: `Tên Excel` | `Thuốc ghép trong Kho` | `Tồn cũ` | `Số lượng nhập (+)` | `Tồn mới (=)` | `Trạng thái (🟢/🟡/🔴)`.
   - Cho phép đổi thuốc ghép bằng ô tìm kiếm tức thì.
   - Cho phép tick chọn tạo mới thuốc nếu thuốc đó chưa từng có trong kho.
5. **Cơ chế Ghi nhớ Ánh xạ (`medicine_aliases`):**
   - Tạo bảng database `medicine_aliases` phân lập theo `clinic_id`.
   - Tự động lưu alias mỗi khi người dùng duyệt đợt nhập.
6. **Cập nhật Tồn kho Nguyên tử (Atomic Inventory Batch Update):**
   - Cập nhật an toàn qua Server Action / Transaction.
   - Ghi nhật ký vào bảng `inventory_transaction_logs` với loại `IMPORT_EXCEL`.
   - Tự động kích hoạt xóa cache client (`invalidateMedicineCatalog()`) để trang kê đơn của bác sĩ nhận số lượng mới ngay lập tức.

### 🎁 Phase 2 (Làm sau):
- Xuất file báo cáo kết quả nhập kho (Excel/PDF) sau mỗi đợt nhập.
- Trang quản lý danh sách từ đồng nghĩa / ánh xạ (`/medicines/aliases`) để xem lại hoặc sửa các cặp tên đã ghép.
- Tùy chọn import cập nhật cả giá nhập / giá bán cho phòng khám muốn quản lý tài chính kho sâu hơn.

### 💭 Backlog (Cân nhắc):
- AI Assistance: Nút "Hỏi AI Gemini" khi gặp tên thuốc chuyên sâu quá khó nhận diện.

---

## 5. ƯỚC TÍNH SƠ BỘ & ĐỘ PHỨC TẠP
- **Độ phức tạp:** 🟡 **Trung bình**
  - Đọc file Excel: Đã có các thư viện client nhẹ (`xlsx`).
  - So khớp chuỗi: Xây dựng helper chuẩn hóa ngữ cảnh dược + token overlap (không phụ thuộc external service, cực nhanh và ổn định).
  - Database: Bổ sung 1 bảng nhẹ `medicine_aliases` với RLS `clinic_id`.
- **Rủi ro & Biện pháp phòng ngừa:**
  - *Rủi ro cộng nhầm thuốc:* Luôn có màn hình Preview 3 màu bắt buộc người dùng bấm xác nhận, không âm thầm chạy ngầm.
  - *Rủi ro file định dạng lạ:* Kiểm tra schema các cột trước khi parse, báo lỗi rõ ràng nếu thiếu cột "Tên thuốc" hoặc "Số lượng".

---

## 6. BƯỚC TIẾP THEO
→ Chuyển sang workflow `/plan` để thiết kế chi tiết:
1. Migration database: Bảng `medicine_aliases` + RLS policies.
2. Service chuẩn hóa tên thuốc (`pharmaMatcher.ts`).
3. Component UI: `ImportMedicineModal.tsx` & `ImportReviewTable.tsx`.
4. Server Actions & Cache Invalidation.
