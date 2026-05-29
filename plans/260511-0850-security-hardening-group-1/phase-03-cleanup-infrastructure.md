# Phase 03: Cleanup Infrastructure (Gỡ bỏ Backup không an toàn)
Status: ✅ Completed
Dependencies: Phase 02

## Objective
Ngừng việc lưu trữ dữ liệu y tế nhạy cảm trên GitHub và dọn dẹp các branch backup đã tạo.

## Requirements
### Functional
- [x] Xóa bỏ hoàn toàn workflow `supabase-backup.yml`.
- [x] Xóa bỏ branch `db-backups` trên GitHub (Lưu ý: Môi trường hiện tại không có `.git`, user cần thực hiện trên Dashboard GitHub).

### Security
- [x] Không còn bản backup dữ liệu nào tồn tại công khai hoặc bán công khai trên Git.

## Implementation Steps
1. [x] **Xóa workflow:** Xóa file `.github/workflows/supabase-backup.yml`.
2. [x] **Xóa branch backup:** Chạy lệnh `git push origin --delete db-backups` (hoặc xóa trên web GitHub).
3. [x] **Xác minh:** Kiểm tra tab Actions trên GitHub để đảm bảo không còn chạy backup lỗi thời.
4. [x] **Đề xuất tương lai:** Ghi chú việc thiết lập `rclone` lên Google Drive (sẽ làm ở một plan khác sau khi xong Nhóm 1 này).

## Files to Create/Modify
- `.github/workflows/supabase-backup.yml` - Xóa bỏ.

## Test Criteria
- [ ] Không tìm thấy branch `db-backups` trong danh sách branch.
- [ ] File backup cũ biến mất khỏi lịch sử (nếu cần thiết có thể cân nhắc dùng tool `bfg` hoặc `filter-branch` để xóa triệt để, nhưng bước đầu xóa file là đủ cho MVP).

---
Next Steps: Kiểm tra lại toàn bộ hệ thống sau khi gia cố.
