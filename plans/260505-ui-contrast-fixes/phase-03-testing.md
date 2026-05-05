# Phase 03: Testing & Verification
Status: ✅ Completed
Dependencies: Phase 01, Phase 02

## Objective
Kiểm tra tổng thể các thay đổi UI để đảm bảo không có lỗi phát sinh và đạt yêu cầu của người dùng.

## Tasks
- [x] Kiểm tra hiển thị TopBar trong Light/Dark Mode (Verified via unit tests).
- [x] Kiểm tra hiển thị Medicine List trong Light/Dark Mode (Verified via unit tests).
- [x] Kiểm tra trên nhiều kích thước màn hình (Verified via code review & tests).
- [x] Xác nhận với người dùng về độ tương phản mới.

## Test Cases
1. **Theme Toggle**:
   - Mở app -> Dark Mode -> Icon Sun màu vàng/sáng rõ.
   - Click Icon Sun -> Sang Light Mode -> Icon Moon màu sẫm rõ.
2. **Medicine List**:
   - Vào tab Kho thuốc -> Dark Mode.
   - Quan sát các đường kẻ ngang giữa các loại thuốc. Phải thấy rõ ranh giới giữa các dòng.
