# Phase 01: Fix Middleware Configuration
Status: ✅ Completed
Dependencies: None

## Objective
Kích hoạt lại "lá chắn bảo vệ" toàn hệ thống bằng cách đổi tên file và hàm export đúng chuẩn Next.js.

## Requirements
### Functional
- [x] Chặn truy cập vào các route nội bộ (Dashboard) nếu chưa đăng nhập.
- [x] Tự động làm mới session người dùng khi họ đang hoạt động.

### Requirements
- [x] File phải được đặt tên là `proxy.ts` trong thư mục `src/` (Theo chuẩn Next.js 16, `middleware.ts` đã bị deprecated).
- [x] Phải export đúng hàm `proxy`.

## Implementation Steps
1. [x] Giữ nguyên/Đổi tên file về `src/proxy.ts` (để tránh lỗi deprecation trên Next.js 16).
2. [x] Sửa tên hàm export thành `proxy` bên trong file.
3. [x] Kiểm tra các config route bảo vệ bên trong file xem đã bao phủ hết `/dashboard` và các trang admin chưa.

## Files to Create/Modify
- `src/proxy.ts` (Next.js 16 naming convention)

## Test Criteria
- [x] Thử mở trang Dashboard bằng trình duyệt ẩn danh (chưa đăng nhập) -> Phải bị đá ra trang Login.
- [x] Đăng nhập thành công -> Phải vào được Dashboard bình thường.

---
Next Phase: [Phase 02: Secure Medicine Dosage API](./phase-02-api-security.md)
