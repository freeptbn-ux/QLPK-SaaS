# Phase 04: Hardening & Headers
Status: ⬜ Pending
Dependencies: Phase 03

## Objective
Tăng cường bảo mật cho ứng dụng (Hardening) thông qua HTTP Headers, CSP và xử lý lỗi an toàn.

## Requirements
### Security
- [ ] Thêm các HTTP Security Headers (CSP, HSTS, X-Frame-Options) vào cấu hình Next.js.
- [ ] Không trả về chi tiết lỗi SQL cho client (che giấu stack trace).
- [ ] Loại bỏ các inline script không an toàn.

## Implementation Steps
1. [ ] Cập nhật `next.config.ts` để thêm trường `headers()`, bao gồm `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, v.v.
2. [ ] Cập nhật `src/app/layout.tsx` để xử lý inline script (nếu có thể chuyển sang script tag thông thường hoặc cấp nonce).
3. [ ] Xây dựng một utility `handleServerError` để format lại các lỗi DB thành thông báo chung chung ("Đã có lỗi xảy ra") trước khi ném về UI.

## Files to Create/Modify
- `next.config.ts` - Cấu hình headers.
- `src/app/layout.tsx` - Sửa inline script.
- Tùy chỉnh các khối `catch (error)` trên toàn app để format lỗi.

## Test Criteria
- [ ] Headers bảo mật xuất hiện trong Network tab khi tải trang.
- [ ] Gây ra lỗi DB và đảm bảo thông báo lỗi trên giao diện không chứa câu lệnh SQL.

---
Hoàn tất!
