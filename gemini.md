# BÁO CÁO LỖI HỆ THỐNG GEMINI API (11/05/2026)

Dưới đây là các lỗi kỹ thuật chi tiết được ghi nhận từ hệ thống Vercel Logs và các bài test thực tế.

## 1. Lỗi Xung Đột Cấu Hình (Lỗi Phổ Biến Nhất)
**Mã lỗi:** `400 INVALID_ARGUMENT`
**Thông báo từ Vercel:** 
> `Tool use with a response mime type: 'application/json' is unsupported`

### Chi tiết:
Hiện tại, kiến trúc của Google Gemini API **không cho phép** kết hợp đồng thời hai tính năng:
- **Tools (Google Search):** Tính năng cho phép AI truy cập internet để tìm thông tin mới nhất.
- **Response MIME Type (application/json):** Tính năng ép AI phản hồi theo định dạng JSON chuẩn.

### Tác động:
Tất cả các yêu cầu tra cứu thuốc đều thất bại khi hệ thống cố gắng vừa tìm kiếm online vừa xuất ra JSON.

---

## 2. Lỗi Rò Rỉ Bảo Mật (API Keys bị lộ)
**Mã lỗi:** `403 PERMISSION_DENIED`
**Thông báo từ Vercel:**
> `Your API key was reported as leaked. Please use another API key.`

### Chi tiết:
Google đã phát hiện và vô hiệu hóa các API Key sau do bị lộ công khai (có thể do vô tình commit lên git hoặc bị quét):
- **Key số 4**
- **Key số 12**

### Tác động:
Hệ thống phải tự động bỏ qua các key này, làm giảm hiệu suất và tổng hạn mức (quota) của toàn dự án.

---

## 3. Lỗi Hết Hạn Mức (Quota Exceeded)
**Mã lỗi:** `429 RESOURCE_EXHAUSTED`
**Thông báo từ thực nghiệm:**
> `Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests`

### Chi tiết:
API Key đang sử dụng (như key anh cung cấp cho thuốc "Atersin") đã chạm ngưỡng giới hạn của bản miễn phí (Free Tier).

---

## 🛠️ ĐỀ XUẤT GIẢI PHÁP (PROPOSED SOLUTIONS)

### Phương án A: Quy trình 2 bước (Chuẩn Premium) - KHUYÊN DÙNG
- **Bước 1:** Gọi AI dùng Google Search để lấy thông tin thuốc (dạng văn bản).
- **Bước 2:** Dùng kết quả đó gọi AI lần 2 để chuyển sang JSON chuẩn.
- **Kết quả:** Có dữ liệu mới nhất + Giao diện ổn định.

### Phương án B: Giữ JSON, bỏ Google Search
- Loại bỏ tính năng tìm kiếm online, chỉ dựa vào kiến thức có sẵn của model.
- **Kết quả:** Chạy nhanh hơn, tiết kiệm token, nhưng thông tin có thể không cập nhật bằng.

### Hành động cần làm ngay:
1. Loại bỏ Key 4 và 12 khỏi cấu hình Vercel.
2. Cập nhật code logic API sang quy trình 2 bước (Phương án A).
