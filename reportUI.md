# Báo Cáo Phân Tích Lỗi Giao Diện (UI Debug Report)

## 1. Hiện tượng (Symptoms)
Dựa vào hình ảnh cung cấp và kiểm tra mã nguồn, giao diện của ứng dụng (đặc biệt là trang Cài đặt - Settings) đang gặp tình trạng vỡ layout nghiêm trọng:
- Chữ (Label) của các trường nhập liệu (`TextField`) bị đè thẳng lên viền và nội dung, ví dụ như "Tên phòng khám", "Mật khẩu hiện tại".
- Các nút bấm (`Button`), ví dụ "Lưu thay đổi", bị ép nhỏ lại, không có khoảng cách lề bên trong (padding) và không hiển thị màu nền (background) chính xác.
- Thẻ nội dung (`CardContent`) không có khoảng cách với nội dung bên trong, các thành phần nằm dính sát vào mép thẻ.
- Nút gạt (Switch) "Chế độ sáng" bị lỗi hiển thị (chỉ còn một chấm tròn xám).

## 2. Phân tích nguyên nhân (Root Cause Analysis)

🔍 **Giả thuyết & Điều tra:**
Lỗi này thường xảy ra khi CSS của Material-UI (MUI) bị hỏng, chưa được load, hoặc **bị một CSS khác có độ ưu tiên cao hơn ghi đè (override)**.

**Quá trình điều tra code:**
1. Kiểm tra file `src/components/ThemeRegistry.tsx`, thấy ứng dụng đang sử dụng:
   `<AppRouterCacheProvider options={{ enableCssLayer: true }}>`
   👉 Tuỳ chọn `enableCssLayer: true` sẽ gom tất cả CSS của MUI vào một CSS Layer có tên là `@layer mui`.

2. Kiểm tra file CSS toàn cục `src/app/globals.css`, phát hiện đoạn code sau:
   ```css
   * {
     box-sizing: border-box;
     padding: 0;
     margin: 0;
   }
   ```
   👉 Đoạn CSS này nằm ngoài Layer (unlayered styles).

📌 **Kết luận nguyên nhân gốc rễ (Root Cause):**
Theo chuẩn CSS hiện đại, **các CSS không nằm trong layer (unlayered styles) sẽ luôn luôn ghi đè (override) các CSS nằm trong layer**, bất kể tính đặc tả (specificity) của selector là gì.
Do đó, bộ chọn `* { padding: 0; margin: 0; }` trong `globals.css` đã "đánh bại" tất cả CSS mặc định của MUI. Toàn bộ `padding` và `margin` của `TextField`, `Button`, `Card`, v.v... của MUI đều bị set về `0`. Điều này làm hỏng hoàn toàn thiết kế của các Component (vốn dĩ phụ thuộc rất nhiều vào padding/margin để tạo hình).

## 3. Cách khắc phục (Resolution)

Em đã thực hiện sửa lỗi trực tiếp trên code:
- **Hành động:** Đã xóa dòng `padding: 0; margin: 0;` khỏi bộ chọn `*` trong file `src/app/globals.css`.
- **Lý do an toàn:** Việc xóa dòng này là hoàn toàn an toàn và chuẩn mực vì dự án đang sử dụng `<CssBaseline />` (được gọi trong `src/theme/ThemeContext.tsx`). `<CssBaseline />` của MUI đã tự động đảm nhiệm việc reset CSS một cách chuẩn xác theo phong cách Material Design (bao gồm cả reset margin của body và box-sizing).

## 4. Kiểm tra lại (Next Steps)
Anh có thể F5 (tải lại trang) trên trình duyệt để kiểm tra. Giao diện trang Cài đặt (và toàn bộ các trang khác dùng MUI) sẽ tự động hiển thị đẹp mắt và gọn gàng trở lại đúng với thiết kế chuẩn của Material-UI.
