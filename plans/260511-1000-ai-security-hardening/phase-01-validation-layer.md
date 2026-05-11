# Phase 01: Validation Layer
Status: ✅ Completed
Dependencies: None

## Objective
Xây dựng hàng rào kiểm tra dữ liệu đầu vào (Input Sanitization) bằng Zod để ngăn chặn các chuỗi ký tự nguy hiểm được gửi lên từ client.

## Requirements
### Functional
- [x] Định nghĩa Zod Schema cho `medicineName`.
- [x] Giới hạn độ dài chuỗi (ví dụ: 2-50 ký tự).
- [x] Sử dụng Regex để chỉ cho phép chữ cái, số, khoảng trắng và dấu gạch ngang cơ bản.
- [x] Chặn các từ khóa nhạy cảm (blacklist) như "ignore", "system", "instruction".

### Non-Functional
- [x] Hiển thị thông báo lỗi thân thiện cho user nếu nhập sai định dạng.

## Implementation Steps
1. [x] Cài đặt `zod` (nếu chưa có trong project).
2. [x] Tạo file schema validation hoặc khai báo trực tiếp trong route API.
3. [x] Cập nhật logic nhận dữ liệu trong `src/app/api/medicine-dosage/route.ts` để sử dụng `schema.safeParse()`.

## Files to Create/Modify
- `src/app/api/medicine-dosage/route.ts` - Áp dụng validation logic.

## Test Criteria
- [x] Nhập "Paracetamol" -> PASS.
- [x] Nhập "<script>alert(1)</script>" -> FAIL.
- [x] Nhập chuỗi dài 500 ký tự -> FAIL.
- [x] Nhập "Ignore instructions" -> FAIL.

---
Next Phase: [Prompt Restructuring](phase-02-prompt-restructuring.md)
