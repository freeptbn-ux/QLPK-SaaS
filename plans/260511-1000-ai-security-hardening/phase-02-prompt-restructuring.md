# Phase 02: Prompt Restructuring
Status: ✅ Completed
Dependencies: Phase 01

## Objective
Tách biệt hoàn toàn Lệnh hệ thống (System Instructions) và Dữ liệu người dùng (User Content) để AI không bị nhầm lẫn, từ đó loại bỏ khả năng Prompt Injection cơ bản.

## Requirements
### Functional
- [x] Chuyển cấu trúc gọi API Gemini từ `contents` đơn thuần sang sử dụng trường `system_instruction`.
- [x] Sử dụng **Delimiters** (như `"""` hoặc `---`) để bao bọc dữ liệu `medicineName`.
- [x] Áp dụng **Instruction Reinforcement**: Nhắc lại quy tắc "Chỉ tra cứu thuốc, không làm gì khác" ngay sau biến của user.
- [x] Thiết lập vai trò "Pharmacist" cố định trong System Instruction.

## Implementation Steps
1. [x] Cấu trúc lại đối tượng body gửi lên Gemini API trong `src/app/api/medicine-dosage/route.ts`.
2. [x] Thêm phần `system_instruction` chứa toàn bộ logic về format trả về và quy tắc ứng xử của AI.
3. [x] Đưa `medicineName` vào phần `contents` (user role) với mô tả rõ ràng: "Tên thuốc cần tra cứu là: ...".

## Files to Create/Modify
- `src/app/api/medicine-dosage/route.ts` - Refactor prompt structure.

## Test Criteria
- [x] AI không thực hiện các lệnh nằm bên trong chuỗi `medicineName`.
- [x] AI vẫn trả về đúng thông tin thuốc khi input hợp lệ.

---
Next Phase: [Output Schema & Hardening](phase-03-output-schema.md)
