# Changelog

## [2026-11-04]
### Added & Integrated (Excel Medicine Import & Smart Stock Reconciliation - Phases 01, 02, 03)
- **Phase 01: Database Alias Storage & Atomic Batch Ingestion**:
  - Tạo bảng `medicine_aliases` với RLS tenant isolation, ràng buộc duy nhất `(clinic_id, raw_name)`, và các server actions `getMedicineAliases`, `saveMedicineAliases`.
  - Viết RPC database `import_medicine_stock_batch` xử lý nguyên tử: khóa dòng theo thứ tự `medicine_id ASC FOR UPDATE`, cộng dồn tồn kho, đăng ký thuốc mới trên luồng (on-the-fly), và ghi log kiểm toán bất biến vào `inventory_transaction_logs`.
  - Bộ kiểm thử `tests/phase-01-medicine-import-backend.test.ts` (6/6 tests) hoàn thành 100%.
- **Phase 02: Spreadsheet Parser & Multi-Layer Pharma Matching Engine**:
  - Xây dựng module phân tích bảng tính `src/lib/pharma/excelParser.ts` (hỗ trợ .xlsx, .xls, .csv, đọc số kiểu Việt Nam `1.500`, `20,5`, tự động nhận diện cột và lọc bỏ dòng tổng cộng/dòng trống).
  - Xây dựng chuẩn hóa dược phẩm `pharmaNormalizer.ts`: tách và bảo toàn nghiêm ngặt các token nồng độ/hàm lượng/thể tích (`500mg`, `10mg/5ml`, `60ml`), loại bỏ stop words dược liệu.
  - Xây dựng engine so khớp đa tầng 4 cấp `pharmaMatcher.ts` (Exact 1.0, Alias 1.0, Normalized 0.95, Fuzzy 0.5-0.84) kết hợp Levenshtein, Trigram, và Sorensen-Dice; chặn hoàn toàn xung đột hàm lượng bảo vệ chống Look-Alike Sound-Alike (LASA).
  - Bộ kiểm thử `tests/phase-02-excel-pharma-matcher.test.ts` (9/9 tests) kiểm chứng thành công trên dữ liệu thực tế `Danh_sach_thuoc.xlsx`.
- **Phase 03: Interactive Reconciliation Modal & Catalog Sync**:
  - Bổ sung nút "Nhập thuốc" trong toolbar kho thuốc `MedicineList.tsx`.
  - Phát triển component modal đối soát `MedicineImportModal.tsx`: vùng kéo thả dropzone hỗ trợ bàn phím (`role="button"`, `tabIndex={0}`, Enter/Space), thông báo lỗi định dạng thân thiện.
  - Bảng đối soát 3 cấp: phân loại badge trạng thái 🟢 Khớp chính xác, 🟡 Cần kiểm tra, 🔴 Chưa khớp, 🔵 Tạo mới; bộ lọc tab xem nhanh; hiển thị trực quan công thức tồn kho `[Tồn hiện tại] + [SL nhập] = [Tồn mới]`.
  - Tính năng đổi thuốc tại chỗ (Inline Autocomplete Search) tìm kiếm nhanh danh mục thuốc phòng khám không bị che khuất bởi scroll modal.
  - Tùy chọn tick "Tạo thuốc mới" tự động trích xuất thông tin quy cách, đơn giá từ file Excel.
  - Đồng bộ commit nguyên tử: cập nhật tồn kho hàng loạt, ghi nhớ ánh xạ người dùng vào `medicine_aliases`, tự động xóa cache `invalidateMedicineCatalog()` để màn hình kê đơn nhận ngay số tồn mới, thông báo Toast và refresh view.
  - Bộ kiểm thử `tests/phase-03-medicine-import-ui.test.tsx` (7/7 tests) hoàn thành 100%.

### Added & Integrated (Instant Medicine Search & Catalog Sync - Phases 01, 02, 03)
- **Phase 01: Client-Side Medicine Catalog Cache Engine**:
  - Xây dựng cache engine bộ nhớ trình duyệt `src/hooks/useMedicineCatalog.ts` sử dụng `useSyncExternalStore` cho danh mục thuốc đang hoạt động của từng phòng khám.
  - Hỗ trợ khử trùng lặp các request đồng thời (request deduplication), stale-while-revalidate TTL 5 phút, và hàm kích hoạt làm mới `invalidateMedicineCatalog()`.
  - Bộ kiểm thử `tests/phase-01-medicine-catalog-cache.test.ts` hoàn thành 100%.
- **Phase 02: Zero-Latency In-Memory Vietnamese Token Search & Autocomplete UI**:
  - Phát triển component `src/components/features/prescriptions/MedicineAutocomplete.tsx` cho phép tìm kiếm thuốc 0ms ngay khi gõ phím.
  - Xử lý tách từ không dấu chuẩn tiếng Việt (`removeDiacritics`), hỗ trợ phím điều hướng mũi tên lên/xuống/Enter, hiển thị trạng thái hết hàng/tồn kho thấp và tự động cảnh báo Toast chặn kê thuốc hết hàng.
  - Bộ kiểm thử `tests/phase-02-instant-medicine-autocomplete.test.ts` hoàn thành 100%.
- **Phase 03: Prescription Integration, Stock Revalidation & Cache Invalidation**:
  - Tích hợp trơn tru `PrescriptionForm`, `PrescriptionItemRow`, và `PrescriptionHistory` với `MedicineAutocomplete` và danh mục thuốc chia sẻ chung.
  - Tự động điền đầy đủ tên thuốc, đơn vị/quy cách đóng gói (`unit`, `packing_spec`) và đơn giá khi chọn gợi ý.
  - Đồng bộ kích hoạt `invalidateMedicineCatalog()` khi lưu đơn thuốc, sửa/thêm đơn thuốc hoặc khi thực hiện các thao tác thay đổi kho (`MedicineFormDialog`, `StockAdjustDialog`, `MedicineList`).
  - Xử lý graceful degradation khi phát hiện thuốc bị hết hàng/lỗi tồn kho trong lúc submit đơn thuốc và đồng thời trigger background revalidation.
  - Bộ kiểm thử `tests/phase-03-prescription-stock-sync.test.ts` (5/5 tests) hoàn thành 100%.

### Restored & Secured (Khôi phục toàn diện dữ liệu Đơn thuốc lịch sử)
- **Disaster Recovery bảng `prescription_details`**:
  - Khôi phục thành công **2.040 bản ghi chi tiết đơn thuốc**, đưa tổng số dòng từ `1.025` lên **`3.065 dòng`**, nâng tỷ lệ bao phủ đơn thuốc có chi tiết lên **976 / 992 đơn (98.4%)** và **259 / 269 bệnh nhân (96.3%)** có đầy đủ 100% lịch sử thuốc.
  - Tái tạo dữ liệu nguyên bản từ bản lưu trữ Git của database (`Supabase Database/prescription_details_rows.sql` cho các đơn $\le$ #818).
  - Tái cấu trúc bộ trích xuất chi tiết thuốc từ `patient_history_logs` và `patients.medical_history`, xử lý lỗi nuốt dòng do ký tự phân dòng `\\n` (literal backslash n) đối với các đơn giai đoạn chuyển tiếp #819 – #888 (đặc biệt là đơn #830 của bệnh nhân 96 Nguyễn Kiều Anh với 3 loại thuốc Aubactam 281, Astemix, Deslotid 30ml khớp 100% tổng tiền 81đ).
  - Viết và chạy script khôi phục toàn diện `scripts/restore_all_prescription_details.js` với cơ chế kiểm tra khóa ngoại, ánh xạ alias chuẩn hóa và chia batch insert an toàn.
  - Đồng bộ và kiểm thử auto-increment của sequence PostgreSQL `prescription_details_id_seq` (đạt mức 47814+), đảm bảo không bao giờ bị lỗi xung đột `duplicate key`.
  - Sao lưu snapshot cục bộ an toàn 13 bảng trước và sau khi khôi phục vào `backups/backup_20261104_142726/`.

## [2026-11-03]
### Fixed & Optimized (Nhóm Medium P2 Performance)
- **PERF-014**: Tối ưu hóa `CountUp` KPI: chuyển sang cập nhật trực tiếp DOM `textContent` qua `ref` và sử dụng `Intl.NumberFormat` singleton module-level, loại bỏ hoàn toàn 60-120 re-renders/giây trên Main Thread.
- **PERF-015**: Thêm `useMemo` và `useCallback` vào `SettingsContext`, `ThemeContext`, `ToastContext`, chặn đứng hiện tượng re-render lan truyền lên toàn bộ cây component con (`TopBar`, `Sidebar`, `DashboardShell`).
- **PERF-011**: Tối ưu hàm `getDrugPresets()` đọc trực tiếp từ `getCachedSettings()`, chia sẻ chung React per-request cache và tiết kiệm 1 database query/round-trip mỗi lần mở trang kê đơn.
- **PERF-012**: Loại bỏ over-fetching danh sách thực thể thuốc sắp hết chỉ để đếm Badge trong trang quản lý kho; thay bằng RPC vô hướng `get_low_stock_count()`.
- **PERF-010**: Xóa bỏ chỉ mục B-tree trùng lặp 100% `idx_prescriptions_patient_date_desc` trên `prescriptions_header` (giữ lại `idx_prescriptions_patient_date`), giảm chi phí cập nhật index và dung lượng WAL khi lưu đơn thuốc.
- **PERF-008**: Bổ sung nhánh lọc `p_filter_type = 'all'` và `p_time_value DEFAULT ''` trong RPC `get_patient_dobs_by_time`, khôi phục hiển thị dữ liệu biểu đồ phân bố nhóm tuổi bệnh nhân.
- **PERF-009**: Hợp nhất toàn diện các Permissive RLS policies trên 5 bảng (`clinic_daily_stats`, `prescriptions_header`, `medicines`, `inventory_transaction_logs`, `settings`, `profiles`), tách các quyền ghi sang `INSERT, UPDATE, DELETE` và chuẩn hóa `(select auth.uid())` theo chuẩn Supabase, đưa số lượng cảnh báo linter về 0.
- **PERF-013**: Thêm cột ảo `is_low_stock` dạng `GENERATED ALWAYS AS (stock_quantity > 0 AND stock_quantity <= min_stock_level) STORED` cùng partial indexes trên bảng `medicines`. Chuyển bộ lọc tồn kho (`low_stock`, `out_of_stock`) sang xử lý phân trang & tính count chính xác từ server-side thay vì cắt lát 20 dòng trên client RAM.
- **Kiểm thử P2**: Thêm bộ test kiểm thử tự động `tests/p2-medium-performance.test.ts` (5/5 tests passed).

### Fixed & Restored
- **Lịch sử dùng thuốc (Medicine Usage)**:
  - Khắc phục lỗi nút "Lịch sử dùng thuốc" bị trống trơn do thiếu dữ liệu chuẩn hóa và lỗi xóa sạch bảng trong unit test.
  - Sửa lỗi trong `tests/phase-03-prescription-triggers.test.ts` (loại bỏ lệnh `adminClient.from('prescription_details').delete().neq('id', 0)` gây xóa sạch dữ liệu đơn thuốc, thay bằng xóa header test để Postgres tự động `CASCADE DELETE`).
  - Khôi phục **1.022 bản ghi** chi tiết đơn thuốc vào bảng `prescription_details` từ 334 snapshot trong `patient_history_logs` và lịch sử bệnh nhân cũ thông qua script `scripts/restore_prescription_details.js`.
  - Cập nhật và kiên cố hóa RPC `get_medicine_usage_by_patient`: hỗ trợ fallback tự động lấy `clinic_id` từ hồ sơ bệnh nhân khi context JWT thiếu claims, thiết lập `search_path` an toàn và sắp xếp thứ tự theo `times_prescribed DESC, m.name ASC`.

### Added
- **Database Local Backup & Automated Recovery Tooling**:
  - Xây dựng bộ công cụ `scripts/backup_supabase.js` và `scripts/restore_supabase.js` hỗ trợ sao lưu toàn bộ 13 bảng cơ sở dữ liệu Supabase kèm schema và tài khoản `auth.users` về máy cục bộ.
  - Tích hợp các lệnh npm tiện ích: `npm run db:backup` và `npm run db:restore` kèm chế độ kiểm thử an toàn `--dry-run` và khôi phục riêng lẻ theo từng bảng `--table <name>`.
  - Thực hiện sao lưu thành công snapshot cục bộ 7.310 bản ghi vào `backups/backup_20261103_061202/` (được bảo vệ qua `.gitignore`).
- **Multi-Tenant Isolation (Phase 01 - P0)**: Bổ sung lọc `clinic_id` trong `get_patients_with_last_visit` và chuyển constraint unique bệnh nhân sang phạm vi từng phòng khám `(clinic_id, LOWER(name_normalized), dob)`.
- **Infrastructure Alignment (Phase 02 - P1)**: Cấu hình Vercel Functions region sang `icn1` (Seoul) đồng bộ với Supabase Seoul (`ap-northeast-2`); khử trùng lặp query bảng `profiles` thông qua `app_metadata.clinic_id`.
- **Prescription Concurrency Optimization (Phase 03 - P1)**: Hợp nhất cascade trigger kê đơn vào RPC `create_prescription` nguyên khối, loại bỏ bão trigger trên `prescription_details` và cập nhật `clinic_daily_stats` dạng $O(1)$ batch upsert.
- **Statistics Waterfall Consolidation (Phase 04 - P1)**: Hợp nhất 14 query riêng rẽ của dashboard và trang thống kê thành 1 RPC `get_dashboard_statistics_v2` duy nhất.
- **Medicine Autocomplete Optimization (Phase 05 - P1)**: Thay thế việc tải 1.000 thuốc lên RAM client bằng tìm kiếm server-side debounced ($\le 20$ kết quả) sử dụng index trigram `pg_trgm` + `unaccent`, tích hợp request sequence guard ngăn race condition khi gõ nhanh.
- **Supabase Remote Synchronization**: Triển khai toàn bộ 4 migration (`multi_tenant_isolation`, `prescription_trigger_consolidation`, `dashboard_statistics_rpc`, `search_medicines_rpc`) lên live project thông qua Supabase MCP.

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

