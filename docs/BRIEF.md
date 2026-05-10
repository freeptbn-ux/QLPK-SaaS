# 💡 BRIEF: Gộp Hồ Sơ Bệnh Nhân (Patient Merge)

**Ngày tạo:** 25/04/2026

---

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT
Hiện tại, dữ liệu phòng khám đang bị phân mảnh do cách lưu cũ: một bệnh nhân đến khám nhiều lần thì bị tạo thành **nhiều ID bệnh nhân khác nhau** (mỗi ID tương ứng 1 lượt khám). 
Điều này làm rác dữ liệu và sai logic thiết kế chuẩn của hệ thống (1 bệnh nhân chỉ nên có 1 ID, và bên trong ID đó chứa nhiều lịch sử khám).

## 2. GIẢI PHÁP ĐỀ XUẤT
Tạo ra một luồng **"Gộp hồ sơ bệnh nhân"** (Merge Patients) ngay trong màn hình "Quản lý Bệnh nhân".
- App sẽ tự động quét và phát hiện các hồ sơ nghi ngờ trùng lặp dựa trên: **Tên (không dấu) + Ngày tháng năm sinh + Số điện thoại**.
- Sau đó, hiển thị danh sách để Bác sĩ/Lễ tân đối chiếu (xem địa chỉ, SĐT) và quyết định gộp.
- Khi gộp: Chuyển toàn bộ "Lịch sử khám" (prescriptions) của các ID phụ về ID chính, sau đó xóa các ID phụ đi.

## 3. THUẬT TOÁN TÌM KIẾM CHI TIẾT
Hệ thống sẽ tìm các bệnh nhân thỏa mãn **ĐỒNG THỜI 3 ĐIỀU KIỆN**:
1. **Tên:** Bỏ dấu, không phân biệt hoa/thường (VD: "Nguyễn Văn A" = "nguyen van a").
2. **Ngày sinh:** Khớp chính xác 100% chuỗi ký tự `dd/mm/yyyy`.
3. **Số điện thoại:** Khớp chính xác.

## 4. GIAO DIỆN & TRẢI NGHIỆM SỬ DỤNG (UI/UX)
- Khi tìm thấy các hồ sơ trùng lặp, hiển thị một **Bảng danh sách** liệt kê rõ: Tên, Ngày sinh, Số điện thoại, Địa chỉ của từng ID.
- Bác sĩ sẽ tự chọn bằng mắt xem ai là người đang đứng trước mặt mình để lấy làm ID "Gốc" (Master ID).
- Bấm "Gộp": Hệ thống làm việc ngầm để đưa tất cả lịch sử khám về ID Gốc.

## 5. ƯỚC TÍNH SƠ BỘ
- **Độ phức tạp:** Trung bình. (Cần viết query gộp data cẩn thận để không làm mất đơn thuốc cũ của bệnh nhân).
- **Rủi ro:** Cần hỏi xác nhận chắc chắn (Confirm dialog) trước khi gộp vì hành động này thay đổi cấu trúc dữ liệu khám bệnh diện rộng.

## 6. BƯỚC TIẾP THEO
→ Chạy `/plan` để lên thiết kế chi tiết (UI, API, Schema changes)
