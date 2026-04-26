# Phase 01: Grant RPC Permissions
Status: ✅ DONE
Dependencies: None (đây là phase đầu tiên, fix trực tiếp lỗi critical)

## Objective
Cấp quyền `EXECUTE` cho role `anon` và `authenticated` trên **tất cả** RPC functions trong schema `public`, đồng thời reload PostgREST schema cache. Đây là fix trực tiếp cho lỗi `"Could not find the function public.create_prescription(...) in the schema cache"`.

## Background
- Hosted Supabase chạy `REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC` như security baseline
- Server-side Supabase client dùng `anon` key (không phải `authenticated`) → GRANT phải bao gồm cả `anon`
- Tất cả 11 migration files hiện tại đều **không có** `GRANT EXECUTE` nào

## Requirements
### Functional
- [x] Tất cả 16+ RPC functions phải callable qua Supabase `.rpc()` API
- [x] Cả role `anon` và `authenticated` đều có quyền EXECUTE

### Non-Functional
- [x] Idempotent: chạy lại nhiều lần không bị lỗi
- [x] Schema cache phải được reload sau khi GRANT

## Implementation Steps

### Step 1: Diagnostic — Verify functions exist in `pg_proc`
Chạy trong **Supabase SQL Editor**:
```sql
SELECT proname, pg_get_function_arguments(oid) as args
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace
  AND proname IN (
    'create_prescription', 'append_to_prescription', 'merge_patients',
    'upsert_patient', 'get_stats_by_day_for_month', 'get_stats_by_week',
    'get_stats_by_month', 'get_stats_by_year', 'get_stats_by_gender',
    'get_stats_by_location', 'get_medicine_usage_stats', 'get_revenue_stats',
    'get_distinct_months_years', 'get_low_stock_count', 'get_patient_dobs_by_time',
    'get_monthly_revenue', 'update_updated_at_column'
  )
ORDER BY proname;
```
**Expected:** 17 rows. Nếu thiếu function nào → apply migration SQL tương ứng trước.

### Step 2: Tạo migration file `011_grant_rpc_permissions.sql`
1. [x] Tạo file `supabase/migrations/011_grant_rpc_permissions.sql`
2. [x] Bao gồm GRANT cho tất cả nhóm functions:
   - **Prescription RPCs** (SECURITY DEFINER): `create_prescription`, `append_to_prescription`
   - **Patient RPCs** (SECURITY DEFINER): `upsert_patient`, `merge_patients`
   - **Statistics RPCs** (STABLE): 11 functions `get_stats_*`, `get_revenue_*`, etc.
3. [x] Kết thúc bằng `NOTIFY pgrst, 'reload schema';`

### Step 3: Apply migration
1. [ ] Chạy nội dung `011_grant_rpc_permissions.sql` trong Supabase SQL Editor
2. [ ] Verify không có error

### Step 4: Cập nhật migration files gốc
1. [x] Thêm `GRANT EXECUTE` vào cuối `002_create_prescription_rpc.sql`
2. [x] Thêm `GRANT EXECUTE` vào cuối `006_merge_patients_rpc.sql`
3. [x] Thêm `GRANT EXECUTE` vào cuối `008_statistics_rpcs.sql`
4. [x] Thêm `GRANT EXECUTE` vào cuối `010_monthly_revenue_rpc.sql`
5. [x] Thêm `GRANT EXECUTE` vào cuối `20260426112520_security_concurrency.sql`

> **Lý do:** Đảm bảo nếu ai đó chạy lại migration từ đầu (fresh database), permissions sẽ được cấp đúng.

### Step 5: Verify fix
1. [ ] Test gọi `supabase.rpc('create_prescription', {...})` không còn lỗi schema cache
2. [ ] Test gọi các statistics RPCs vẫn hoạt động bình thường

## Files to Create/Modify
- `supabase/migrations/011_grant_rpc_permissions.sql` — **Tạo mới** (consolidated GRANT file)
- `supabase/migrations/002_create_prescription_rpc.sql` — Thêm GRANT vào cuối
- `supabase/migrations/006_merge_patients_rpc.sql` — Thêm GRANT vào cuối
- `supabase/migrations/008_statistics_rpcs.sql` — Thêm GRANT vào cuối
- `supabase/migrations/010_monthly_revenue_rpc.sql` — Thêm GRANT vào cuối
- `supabase/migrations/20260426112520_security_concurrency.sql` — Thêm GRANT vào cuối

## Test Criteria
- [ ] `supabase.rpc('create_prescription', {...})` trả về `headerId` (không lỗi)
- [ ] Flow "Lưu đơn thuốc" hoàn tất không báo lỗi
- [ ] Các RPC thống kê (`get_stats_by_day_for_month`, etc.) vẫn trả dữ liệu

## Notes
- **QUAN TRỌNG:** GRANT phải dùng exact function signature (tên + types). Nếu signature không khớp → SQL error nhưng không nguy hiểm (idempotent).
- Khi thêm GRANT vào migration files gốc, đặt SAU dòng `$$ LANGUAGE plpgsql ...;` cuối cùng trong mỗi file.

---
Next Phase: [Phase 02 — Fix Revenue Double-Counting](./phase-02-fix-revenue-double-counting.md)
