# Phase 04: Testing & Verification
Status: ✅ Completed
Dependencies: Phase 03

## Objective
Kiểm thử thực tế với các kịch bản tấn công (Adversarial Testing) để đảm bảo hệ thống đã thực sự an toàn.

## Requirements
### Functional
- [x] Chạy bộ test case tấn công: Prompt Injection, Overlong input, Special characters.
- [x] Kiểm tra tính ổn định của UI khi nhận JSON từ AI.

## Implementation Steps
1. [x] Sử dụng công cụ Postman hoặc script test để gửi các request "độc hại".
2. [x] Quan sát log server và kết quả trả về.
3. [x] Chỉnh sửa lại prompt nếu AI vẫn còn sơ hở.

## Files to Create/Modify
- `src/app/api/medicine-dosage/route.ts` - Tinh chỉnh cuối cùng (nếu cần).

## Test Criteria
- [x] 100% các request "bẻ lái" bị chặn bởi Zod hoặc bị AI phớt lờ lệnh hack.
- [x] App không bị crash khi AI trả về kết quả lạ.

---
Finish Plan
