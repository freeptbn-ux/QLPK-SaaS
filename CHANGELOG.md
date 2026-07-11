# Changelog

## [2026-07-11]
### Added
- **Tìm kiếm Debounce Lịch sử Kê đơn**: Thêm tính năng bộ lọc tìm kiếm theo tên thuốc & quy cách đóng gói có Debounce 300ms, kèm hoạt ảnh mượt mà của `Framer Motion` và tự động focus.
- **Liên kết Số điện thoại Thông minh**: Tích hợp liên kết `tel:` cho số điện thoại bệnh nhân ở danh sách Desktop (bảng) và Mobile (cards) kèm `e.stopPropagation()` tránh chuyển trang nhầm lẫn.
- **Hiệu ứng Hover Danh sách Bệnh nhân**: Thêm hover state trực quan trên desktop và mobile cho danh sách bệnh nhân.
- **Unit Tests Mới**: Bổ sung bộ kiểm thử `MedicineUsageDialog.test.tsx`, `PatientClickableRowCard.test.tsx`, `PatientListOptimizations.test.tsx`.
- **Cấu hình Bỏ qua .venv**: Cấu hình `.venv/` trong `.gitignore` để tránh đẩy môi trường ảo Python lên git repository.

### Changed
- **README.md Tiếng Việt**: Viết lại và nâng cấp tài liệu README tiếng Việt chi tiết với placeholder bản quyền tự động cập nhật theo năm build (`2026`).

### Removed
- **Dọn dẹp Repository**: Xóa bỏ thư mục `plans/` lỗi thời và dọn dẹp các tệp tin kế hoạch cũ trên GitHub.
- **Lược bỏ nút dư thừa**: Xóa nút "In đơn thuốc" ở trang chi tiết bệnh nhân và nút "Dọn trùng" (Merge duplicates) ở danh sách bệnh nhân.

## [2026-05-11]
### Added
- Automated Daily Backup to Google Drive via GitHub Actions.
- Rclone configuration for secure database dump storage.

### Fixed
- **Critical Security**: Removed hardcoded database credentials from the repository.
- **Infrastructure**: Resolved IPv6 connectivity issues in GitHub Actions by switching to Supavisor Pooler.
- **Rclone**: Fixed base64 decoding error in CI/CD by using non-wrapping encoding.
- **Backdoor Entry**: Disabled `src/actions/system.ts` which allowed client-side migration execution.

### Security
- Migrated all database secrets to GitHub Secrets and `.env`.
- **Revoked Anon Access**: Removed all permissions for the `anon` role on the `public` schema.
- **Enforced RLS**: Enabled Row Level Security on the `clinics` table and added multi-tenancy policies.
- **Lockdown Complete**: Successfully finished all phases of Security Hardening Group 1.
- **AI Hardening**: Implemented 4-phase security hardening for `medicine-dosage` API.
  - Zod-based input validation (Length, Regex, Keyword Blacklist).
  - Prompt Injection mitigation via Delimiters and System Instructions.
  - Enforced Structured Output using Gemini JSON Schema.
  - Added comprehensive Adversarial Testing suite.

### Added
- **Optimized Statistics Engine**: Introduced `clinic_daily_stats` rollup table for near-instant dashboard loading.
- **Data Integrity Tests**: New `src/test/stats_integrity.test.ts` to verify reconciliation and security isolation.
- Vietnamese `README.md` with project overview and tech stack.
- New adversarial and unit test files for AI safety verification.

### Fixed
- **Critical Security**: Patched data leak in `getOverviewStats` and `getRevenueStats` by enforcing `clinic_id` filtering.
- **Reporting Accuracy**: Fixed 7-hour timezone delay in monthly reports using `dayjs.tz`.
- **Chart Logic**: Implemented proper weekly and monthly grouping for revenue statistics.
- **Runtime Error**: Resolved `ReferenceError: useMedicineDosage is not defined` in `PrescriptionForm.tsx`.

### Changed
- **Gemini Architecture**: Refactored `medicine-dosage` API to use a **Two-Step Architecture**.
  - **Step 1 (Grounding)**: Uses Google Search to fetch real-world medicine data.
  - **Step 2 (Structuring)**: Formats the fetched data into a strict JSON schema.
  - This solves the conflict where Gemini cannot use Search and JSON mode in a single call.
- **AI Model**: Switched to `gemini-2.5-flash-lite` for improved cost-performance and stability.
- **Security**: Removed expired/leaked API keys and transitioned to environment-based key management in tests.

### Added
- **Pediatric Dosage Refactor**: Enhanced AI prompts and UI for better clinical accuracy.
- **UX Highlighting**: Implemented automatic bolding for age group headings in dosage results.
- **Scrollable Modal**: Added scroll support and single-column layout for medicine dosage lookup.
- **UX Tests**: New test suite for verifying formatting markers (`-`, `+`) and real-world medicine accuracy.

### Changed
- **Dosage Layout**: Reordered sections to prioritize "Children" dosage over "Adults" and "Usage".
- **AI Prompts**: Refined formatting instructions to enforce hierarchical age-based structure.

