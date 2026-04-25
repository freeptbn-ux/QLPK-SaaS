# Phase 02: Dry Run & Testing
Status: ✅ Done
Dependencies: Phase 01

## Objective
Chạy script ở chế độ an toàn (Dry Run) để review các bản ghi sắp bị xóa xem có chính xác không.

## Requirements
### Functional
- [x] Chạy lệnh `python scripts/cleanup_duplicates.py` (mặc định dry-run).
- [x] Review kết quả trên Terminal.
- [x] Đảm bảo đơn thuốc `#813` và `#815` của bệnh nhân Nguyễn Quang Nhật (và các ca tương tự) được phát hiện chính xác là bị lặp.

## Implementation Steps
1. [x] Cài đặt môi trường nếu chưa có (`pip install supabase` nếu đã có).
2. [x] Run script.
3. [x] Kiểm tra chéo ID bị list xóa với dữ liệu thực tế xem có xóa nhầm đơn thuốc hợp lệ không.

## Test Criteria
- [x] Output chính xác danh sách các ID bị lặp.
- [x] Không có ID gốc (ID được giữ lại) nằm trong danh sách xóa.

---
Next Phase: phase-03-execution.md
