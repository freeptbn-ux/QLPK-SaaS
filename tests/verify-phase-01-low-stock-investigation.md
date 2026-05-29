# Verify Phase 01 - Low Stock Investigation

## Expected Evidence
- [x] `1.md` có lỗi P0001 `Not authenticated or clinic_id missing`.
- [x] `src/actions/medicines.ts` gọi `supabase.rpc('get_low_stock_medicines')` không truyền tham số.
- [x] Live Supabase function `get_low_stock_medicines` không có argument.
- [x] Live Supabase function đọc `auth.jwt() ->> 'clinic_id'`.
- [x] Live `profiles.clinic_id` tồn tại để dùng làm membership check.
- [x] Live `medicines.is_active` tồn tại và cần được giữ trong filter.

## Pass Condition
Phase 01 pass khi có đủ bằng chứng rằng lỗi đến từ việc RPC lệ thuộc JWT
`clinic_id`, trong khi app có fallback `profiles.clinic_id`.

## Findings & Differences
- **Local Migration** (`20260511000300_add_medicine_rpcs.sql`) lacks the `is_active = true` filter.
- **Live Supabase** (`public.get_low_stock_medicines`) contains `AND is_active = true`. We must preserve this filter in our final strategy to prevent showing inactive/deleted medicines.
- **Live `profiles` Table** has a `clinic_id` column of type `bigint`, which is used in Next.js to determine `clinicId`.
- **Live `medicines` Table** has a `clinic_id` column of type `bigint` and `is_active` of type `boolean`.
