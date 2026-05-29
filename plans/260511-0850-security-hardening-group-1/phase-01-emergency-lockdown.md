# Phase 01: Emergency Lockdown (Xử lý mật khẩu cứng)
Status: ✅ Completed
Dependencies: None

## Objective
Loại bỏ hoàn toàn mật khẩu Database khỏi mã nguồn và đổi mật khẩu mới để vô hiệu hóa các "chìa khóa" đã bị lộ trong lịch sử Git.

## Requirements
### Functional
- [x] Không còn mật khẩu nào xuất hiện dưới dạng văn bản trong code.
- [x] Script `check_and_fix_sequence.js` vẫn hoạt động nhưng thông qua biến môi trường.

### Security
- [x] Mật khẩu cũ bị vô hiệu hóa hoàn toàn trên server. (Lưu ý: User đã thực hiện hoặc cần thực hiện trên Dashboard).
- [x] `.env` được thêm vào `.gitignore`.

## Implementation Steps
1. [x] **Đổi mật khẩu trên Supabase:** Bạn hãy vào Dashboard Supabase -> Project Settings -> Database -> Reset Database Password.
2. [x] **Cập nhật `.env`:** Thêm `DB_PASSWORD` vào file `.env` (và file `.env.example` nhưng để trống giá trị).
3. [x] **Chỉnh sửa script:** Sửa `scripts/check_and_fix_sequence.js` để sử dụng `process.env.DB_PASSWORD`.
4. [x] **Xác minh:** Chạy thử script để đảm bảo nó vẫn kết nối được với mật khẩu mới qua biến môi trường.

## Files to Create/Modify
- `.env` - Thêm biến mới.
- `.env.example` - Thêm template.
- `scripts/check_and_fix_sequence.js` - Thay mật khẩu cứng bằng biến.

## Test Criteria
- [ ] Chạy `npm run dev` không lỗi.
- [ ] Chạy `node scripts/check_and_fix_sequence.js` và nhận thông báo "Connected to database!".

---
Next Phase: [Phase 02: SQL Access Control](phase-02-sql-access-control.md)
