# Phase 03: Output Schema & Hardening
Status: ✅ Completed
Dependencies: Phase 02

## Objective
Ép AI trả về dữ liệu theo cấu trúc JSON chuẩn (Response Schema) để ngăn chặn việc AI trả về text tự do hoặc mã độc, đồng thời giúp Frontend xử lý dữ liệu tin cậy hơn.

## Requirements
### Functional
- [x] Cấu hình `response_mime_type: "application/json"` trong Gemini request.
- [x] Sử dụng tính năng **`response_schema`** chính thức của Gemini API (Structured Output) để định nghĩa các trường: `medicine_name`, `adult_dosage`, `children_dosage`, `usage_instructions`, `description`.
- [x] Loại bỏ hoàn toàn việc parse thủ công bằng Regex (nếu có), tin tưởng vào schema của model.

## Implementation Steps
1. [x] Cập nhật `generationConfig` trong file `route.ts`.
2. [x] Định nghĩa Schema JSON cho kết quả mong muốn.
3. [x] Refactor logic parse kết quả ở đầu backend để khớp với schema mới.

## Files to Create/Modify
- `src/app/api/medicine-dosage/route.ts` - Implement JSON output mode.

## Test Criteria
- [x] Kết quả trả về từ API luôn là JSON hợp lệ.
- [x] Frontend hiển thị đúng các trường dữ liệu mới.


---
Next Phase: [Testing & Verification](phase-04-testing-verification.md)
