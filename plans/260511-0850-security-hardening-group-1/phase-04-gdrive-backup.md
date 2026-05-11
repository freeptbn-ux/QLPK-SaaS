# Phase 04: Google Drive Backup Workflow
Status: ✅ Completed
Dependencies: Phase 03

## Objective
Tự động hóa việc backup database Supabase lên Google Drive hàng ngày thông qua GitHub Actions và Rclone.

## Requirements
- [x] Cài đặt Rclone trên máy local (User đã làm).
- [x] Lấy được `RCLONE_CONFIG` (User đã cung cấp).
- [x] Tạo file workflow GitHub Actions.
- [x] Cấu hình Secrets trên GitHub Repo.
- [x] Test chạy thử workflow thành công.

## Implementation Steps
1. [x] **Cài đặt Rclone & Config:** Hướng dẫn user cài đặt và lấy token.
2. [x] **Viết Workflow:** Tạo file `.github/workflows/google-drive-backup.yml`.
3. [x] **Cấu hình Secrets:** User dán `RCLONE_CONFIG` và `SUPABASE_DB_URL` vào GitHub.
4. [x] **Xác minh:** Chạy manual workflow trên GitHub Actions tab.

## Files to Create/Modify
- `.github/workflows/google-drive-backup.yml`
