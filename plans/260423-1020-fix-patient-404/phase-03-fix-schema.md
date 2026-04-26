# Phase 03: Fix Database Schema - Thêm cột thiếu
**Status:** ✅ Completed
**Dependencies:** Phase 01, Phase 02
**Ưu tiên:** 🟡 Medium - Kê đơn thuốc sẽ fail nếu thiếu cột `updated_at`

## Objective
Thêm cột `updated_at` vào bảng `patients` trong Supabase, vì hàm RPC `create_prescription` đang cập nhật cột này nhưng schema ban đầu không tạo nó.

## Root Cause Analysis

### Vấn đề
RPC `create_prescription` (migration 002) chạy:
```sql
-- Line 56-57
UPDATE patients 
SET 
  diagnosis = p_diagnosis,
  medical_history = v_history_text,
  updated_at = NOW()           -- ← Cột này KHÔNG có trong schema 001!
WHERE id = p_patient_id;
```

Nhưng schema ban đầu (migration 001) chỉ có:
```sql
CREATE TABLE IF NOT EXISTS patients (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  dob TEXT,
  gender TEXT,
  address TEXT,
  phone TEXT,
  weight TEXT,
  medical_history TEXT,
  diagnosis TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name_normalized TEXT
  -- KHÔNG có updated_at!
);
```

### Hậu quả
- Nếu cột `updated_at` chưa được tạo thủ công trên Supabase → RPC `create_prescription` sẽ FAIL khi kê đơn
- Nếu đã tạo thủ công → cần document lại để migration files nhất quán

## Requirements
### Functional
- [x] Tạo migration file mới thêm cột `updated_at` vào bảng `patients`
- [x] Chạy migration trên Supabase (hoặc hướng dẫn chạy thủ công)
- [x] Cập nhật TypeScript interface `Patient` thêm field `updated_at`

### Non-Functional
- [ ] Migration phải idempotent (dùng `IF NOT EXISTS`)
- [ ] Không ảnh hưởng dữ liệu hiện có

## Implementation Steps
1. [x] Tạo file migration mới `supabase/migrations/003_add_updated_at.sql`
2. [x] Nội dung: `ALTER TABLE patients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();`
3. [x] Cập nhật `src/types/database.ts` - thêm `updated_at?: string` vào interface `Patient`
4. [x] Chạy SQL trực tiếp trên Supabase Dashboard (SQL Editor)
5. [x] Verify: Tạo thử 1 đơn thuốc → kiểm tra cột `updated_at` được cập nhật
6. [x] `npm run build` thành công

## Files to Create/Modify
- `supabase/migrations/003_add_updated_at.sql` - **Tạo mới** - Migration thêm cột
- `src/types/database.ts` - Thêm field `updated_at` vào interface `Patient`

## SQL Migration Content
```sql
-- Migration 003: Add updated_at column to patients table
-- Required by create_prescription and append_to_prescription RPCs

ALTER TABLE patients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Backfill existing rows
UPDATE patients SET updated_at = created_at WHERE updated_at IS NULL;
```

## Test Criteria
- [x] SQL migration chạy thành công trên Supabase
- [x] Kê đơn thuốc mới cho bệnh nhân → không lỗi
- [x] Kiểm tra bảng `patients` có cột `updated_at` và được cập nhật đúng
- [x] `npm run build` thành công

---
✅ Hoàn thành tất cả 3 phases = Lỗi 404 và các bug liên quan đã được fix!
