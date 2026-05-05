# 💡 BRIEF: Tắt Autocomplete cho Form Bệnh Nhân

**Ngày tạo:** 2026-05-01
**Trạng thái:** Brainstorming

---

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT
Trình duyệt tự động hiển thị gợi ý các giá trị đã nhập trước đó (autocomplete) khi người dùng nhập thông tin vào các ô (như Họ và tên, Số điện thoại...) trong form "Cập nhật thông tin bệnh nhân". Việc này làm che khuất giao diện và có thể gây nhầm lẫn dữ liệu.

## 2. GIẢI PHÁP ĐỀ XUẤT
Cấu hình thuộc tính `autocomplete="off"` cho các trường nhập liệu trong Form bệnh nhân để yêu cầu trình duyệt không lưu và không hiển thị gợi ý cũ.

## 3. ĐỐI TƯỢNG SỬ DỤNG
- Nhân viên phòng khám, Bác sĩ khi nhập liệu thông tin bệnh nhân.

## 4. PHƯƠNG ÁN KỸ THUẬT
- **Vị trí xử lý:** `src/components/features/patients/PatientFormDialog.tsx`
- **Cách làm:**
  - Thêm `autoComplete="off"` vào các component `Input` của form.
  - Áp dụng cho các trường: Họ và tên, Số điện thoại, Cân nặng, Địa chỉ, Chẩn đoán.

## 5. CÁC BƯỚC TIẾP THEO
1. Xác nhận phương án với User.
2. Chạy `/plan` để lên danh sách các file cần sửa.
3. Thực hiện sửa code.

---
## 6. ĐÁNH GIÁ SƠ BỘ
- **Độ phức tạp:** 🟢 Rất thấp
- **Thời gian dự kiến:** 5-10 phút.
