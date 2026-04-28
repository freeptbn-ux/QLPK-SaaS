# Phase 04: Hardening & Headers
Status: ✅ Completed
Dependencies: Phase 03

## Objective
Tăng cường bảo mật cho ứng dụng (Hardening) thông qua HTTP Headers, CSP và xử lý lỗi an toàn.

## Requirements
### Security
- [x] Thêm các HTTP Security Headers (CSP, HSTS, X-Frame-Options) vào cấu hình Next.js.
- [x] Không trả về chi tiết lỗi SQL cho client (che giấu stack trace).
- [x] Loại bỏ các inline script không an toàn.

## Implementation Steps
1. [x] Cập nhật `next.config.ts` để thêm trường `headers()`, bao gồm `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, v.v.
2. [x] Cập nhật `src/app/layout.tsx` để xử lý inline script (đã chuyển sang `public/theme.js`).
3. [x] Xây dựng một utility `handleServerError` để format lại các lỗi DB thành thông báo chung chung ("Đã có lỗi xảy ra") trước khi ném về UI.

## Files to Create/Modify
- `next.config.ts` - Cấu hình headers.
- `src/app/layout.tsx` - Sửa inline script.
- `src/lib/error-handler.ts` - Central error masking utility.
- `public/theme.js` - Externalized theme script.
- Các file actions: `patients.ts`, `prescriptions.ts`, `medicines.ts`, `settings.ts`.

## Test Criteria
- [x] Headers bảo mật xuất hiện trong Next.js config.
- [x] Gây ra lỗi DB và đảm bảo thông báo lỗi trên giao diện không chứa câu lệnh SQL (đã test qua vitest).

---
Hoàn tất!
