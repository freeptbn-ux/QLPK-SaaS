# Phase 03: Harden Migration Runner
Status: ✅ Done
Dependencies: Phase 01, Phase 02 (các migration files mới phải được tạo trước)

## Objective
Sửa migration runner trong `src/actions/system.ts` để nó chạy **tất cả** migration files (hiện chỉ chạy 2/11+), đảm bảo idempotent, và document rõ dependency `DB_PASSWORD`.

## Background
### Hiện trạng `system.ts`:
```typescript
const migrations = [
  '002_create_prescription_rpc.sql',
  '006_merge_patients_rpc.sql'
];
```
**Thiếu 9+ files:** 003, 004, 005, 007, 008, 009, 010, 011 (GRANT), 012 (revenue fix), và security migration.

### Hiện trạng `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```
**Thiếu `DB_PASSWORD`** → `runDatabaseMigration()` sẽ trả về error "Thiếu ... DB_PASSWORD".

## Requirements
### Functional
- [ ] Migration runner chạy tất cả migration files theo đúng thứ tự
- [ ] Mỗi migration phải idempotent (chạy lại không lỗi) — đã đảm bảo bằng `CREATE OR REPLACE`, `IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`
- [ ] Document rõ ràng cách lấy `DB_PASSWORD` cho user

### Non-Functional
- [ ] Runner phải report từng file đã chạy (logging)
- [ ] Nếu 1 migration fail, vẫn tiếp tục chạy các file sau (best-effort) hoặc rollback rõ ràng

## Implementation Steps

### Step 1: Cập nhật danh sách migrations
1. [ ] Mở `src/actions/system.ts`
2. [ ] Cập nhật array `migrations` để bao gồm **tất cả** files theo thứ tự:
   ```typescript
   const migrations = [
     '001_initial_schema.sql',
     '002_create_prescription_rpc.sql',
     '003_add_updated_at.sql',
     '004_consolidate_patients.sql',
     '005_unique_patient_constraint.sql',
     '006_merge_patients_rpc.sql',
     '007_enforce_mandatory_patient_fields.sql',
     '008_statistics_rpcs.sql',
     '009_trigram_indexes.sql',
     '010_monthly_revenue_rpc.sql',
     '011_grant_rpc_permissions.sql',
     '012_fix_revenue_double_counting.sql',
     '20260426112520_security_concurrency.sql',
   ];
   ```

### Step 2: Thêm error handling per-file
1. [ ] Wrap mỗi `client.query(sql)` trong try-catch riêng
2. [ ] Log kết quả từng file: ✅ thành công / ❌ thất bại + error message
3. [ ] Trả về summary report thay vì chỉ `{ success: true/false }`

### Step 3: Bỏ đoạn drop unique constraint
1. [ ] Xóa đoạn `DROP INDEX IF EXISTS idx_patients_unique_person` — đây là legacy debug code, không nên có trong production runner

### Step 4: Document `DB_PASSWORD`
1. [ ] Thêm comment trong `.env.local` hướng dẫn lấy DB_PASSWORD:
   ```
   # Get from: Supabase Dashboard → Settings → Database → Connection string → Password
   # DB_PASSWORD=your-database-password-here
   ```
2. [ ] Cập nhật README hoặc tạo note trong `system.ts` về cách setup

### Step 5: (Optional) Auto-scan migration folder
1. [ ] Thay vì hardcode danh sách, dùng `fs.readdir()` để scan `supabase/migrations/` và sort alphabetically
2. [ ] Điều này đảm bảo migrations mới sẽ tự động được pick up

## Files to Create/Modify
- `src/actions/system.ts` — Cập nhật migration list, error handling, bỏ drop index
- `.env.local` — Thêm comment hướng dẫn `DB_PASSWORD`

## Test Criteria
- [ ] `runDatabaseMigration()` chạy không lỗi (giả sử có `DB_PASSWORD`)
- [ ] Log output hiển thị rõ từng file đã chạy
- [ ] Chạy lại lần 2 không bị lỗi (idempotent)
- [ ] Không còn đoạn `DROP INDEX` debug
- [ ] Migrations mới (011, 012) được bao gồm

## Notes
- **⚠️ Migration runner này KHÔNG phải critical path** — user đang dùng Supabase SQL Editor để apply migrations thủ công. Nhưng cần fix để developer experience tốt hơn và tránh "works on my machine" issues.
- `DB_PASSWORD` là sensitive value → KHÔNG commit vào git. Chỉ document cách lấy.

---
Next Phase: [Phase 04 — Verification & Smoke Test](./phase-04-verification-smoke-test.md)
