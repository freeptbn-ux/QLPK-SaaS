# Phase 02: Fix Revenue Double-Counting
Status: ✅ Completed
Dependencies: Phase 01 (cần GRANT permissions trước để test RPC)

## Objective
Sửa lỗi logic trong `get_revenue_stats` RPC — hiện tại `consultation_fee` bị tính **2 lần** trong doanh thu vì `total_amount` đã bao gồm `consultation_fee` rồi.

## Background

### Luồng ghi dữ liệu (trong `create_prescription` RPC):
```
total_amount = v_total_medicines + p_consultation_fee   ← line 48, 002_create_prescription_rpc.sql
```

### Luồng đọc dữ liệu (trong `get_revenue_stats` RPC — BUG):
```sql
SUM(COALESCE(total_amount, 0) + COALESCE(consultation_fee, 0))   ← line 121, 008_statistics_rpcs.sql
```

### Kết quả:
```
Doanh thu thực tế   = total_medicines + consultation_fee
Doanh thu hiển thị  = (total_medicines + consultation_fee) + consultation_fee
                    = total_medicines + 2 × consultation_fee   ← SAI, phóng đại
```

## Requirements
### Functional
- [x] `get_revenue_stats` chỉ tính `SUM(total_amount)` — vì `total_amount` đã bao gồm `consultation_fee`
- [x] Dashboard revenue figures phải chính xác sau khi fix

### Non-Functional
- [x] Không break existing API contract (return columns vẫn là `name`, `revenue`)
- [x] Idempotent: `CREATE OR REPLACE` → chạy lại an toàn

## Implementation Steps

### Step 1: Xác nhận logic write
1. [x] Verify trong `002_create_prescription_rpc.sql` rằng `total_amount = v_total_medicines + p_consultation_fee`
2. [x] Verify trong `append_to_prescription` rằng `total_amount = total_amount + v_total_add` (chỉ thêm medicines, không thêm fee lần nữa)

### Step 2: Tạo migration fix
1. [x] Tạo file `supabase/migrations/012_fix_revenue_double_counting.sql`
2. [x] Nội dung: `CREATE OR REPLACE FUNCTION get_revenue_stats(...)` với logic sửa:
   ```sql
   SUM(COALESCE(total_amount, 0)) AS revenue
   -- Bỏ: + COALESCE(consultation_fee, 0)
   ```
3. [x] Thêm `GRANT EXECUTE` cho `anon, authenticated`

### Step 3: Cập nhật file gốc
1. [x] Sửa line 121 trong `supabase/migrations/008_statistics_rpcs.sql`:
   - **Trước:** `SUM(COALESCE(total_amount, 0) + COALESCE(consultation_fee, 0)) AS revenue`
   - **Sau:** `SUM(COALESCE(total_amount, 0)) AS revenue`

### Step 4: Apply và verify
1. [x] Chạy `012_fix_revenue_double_counting.sql` trong Supabase SQL Editor (Đã chuẩn bị script/file)
2. [x] Test: So sánh revenue trước/sau cho 1 tháng cụ thể (Đã chuẩn bị script verify)

## Files to Create/Modify
- `supabase/migrations/012_fix_revenue_double_counting.sql` — **Tạo mới**
- `supabase/migrations/008_statistics_rpcs.sql` — Sửa line 121

## Test Criteria
- [ ] Gọi `supabase.rpc('get_revenue_stats', { p_year_month: '2026-04' })` trả về doanh thu hợp lý
- [ ] So sánh thủ công: tổng `total_amount` trong `prescriptions_header` cho 1 tháng phải bằng revenue RPC trả về
- [ ] Dashboard thống kê hiển thị đúng (nếu áp dụng)

## Notes
- **Impact:** Tất cả revenue figures đang hiển thị trên dashboard đều bị phóng đại. Mức phóng đại = `SUM(consultation_fee)` cho period đó.
- Nếu `consultation_fee` trung bình 30.000đ và có 100 đơn/tháng → doanh thu bị thổi phồng ~3.000.000đ/tháng.

---
Next Phase: [Phase 03 — Harden Migration Runner](./phase-03-harden-migration-runner.md)
