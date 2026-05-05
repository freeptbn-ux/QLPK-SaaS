# Phase 01: Fix Revenue RPCs — Thêm consultation_fee vào doanh thu

Status: ⬜ Pending
Dependencies: Không
Fixes: Bug #1 (🔴 Nghiêm trọng)

## Objective

Sửa 2 RPC trong database để tính đúng doanh thu = `total_amount` + `consultation_fee`.
Hiện tại doanh thu đang thiếu ~36% vì bỏ sót phí khám bệnh.

## Bằng chứng (từ thongke.md)

```
Tháng 5/2026:
- Doanh thu KHÔNG tính phí khám: 2,743 đ
- Doanh thu CÓ tính phí khám:   4,303 đ  
- Tổng phí khám bị bỏ sót:      1,560 đ  (~36%)
```

## Implementation Steps

### Step 1: Fix RPC `get_monthly_revenue_total`

Chạy migration sửa RPC:

```sql
CREATE OR REPLACE FUNCTION get_monthly_revenue_total()
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(
      COALESCE(total_amount, 0) + COALESCE(consultation_fee, 0)
    ), 0)
    FROM prescriptions_header
    WHERE prescription_date >= date_trunc('month', CURRENT_DATE)
  );
END;
$$;
```

**Giải thích thay đổi:**
- Trước: `SUM(total_amount)` → chỉ tính tiền thuốc
- Sau: `SUM(total_amount + consultation_fee)` → tính cả phí khám
- Dùng `COALESCE(..., 0)` cho cả 2 cột vì `consultation_fee` có thể NULL (đơn cũ)

### Step 2: Fix RPC `get_revenue_stats`

```sql
CREATE OR REPLACE FUNCTION get_revenue_stats(p_year_month text DEFAULT NULL)
RETURNS TABLE(name text, revenue numeric)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_char(prescription_date, 'MM/YYYY') AS name,
    SUM(
      COALESCE(total_amount, 0) + COALESCE(consultation_fee, 0)
    )::numeric AS revenue
  FROM prescriptions_header
  WHERE (p_year_month IS NULL OR (
    prescription_date >= (p_year_month || '-01')::date
    AND prescription_date < ((p_year_month || '-01')::date + interval '1 month')
  ))
  GROUP BY to_char(prescription_date, 'MM/YYYY'), DATE_TRUNC('month', prescription_date)
  ORDER BY DATE_TRUNC('month', prescription_date) ASC;
END;
$$;
```

**Giải thích thay đổi:**
- Trước: `SUM(COALESCE(total_amount, 0)::numeric)` → chỉ total_amount
- Sau: `SUM(COALESCE(total_amount, 0) + COALESCE(consultation_fee, 0))::numeric` → cả 2

### Step 3: Fix RPC `get_medicine_usage_stats` (cũng liên quan doanh thu)

```sql
CREATE OR REPLACE FUNCTION get_medicine_usage_stats(p_year_month text DEFAULT NULL)
RETURNS TABLE(name text, "totalQuantity" bigint, "totalRevenue" numeric)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.name,
    SUM(pd.quantity)::bigint AS "totalQuantity",
    ROUND(SUM((pd.quantity * pd.unit_price)::numeric), 2) AS "totalRevenue"
  FROM prescription_details pd
  INNER JOIN medicines m ON m.id = pd.medicine_id
  LEFT JOIN prescriptions_header ph ON ph.id = pd.prescription_header_id
  WHERE (p_year_month IS NULL OR (
    ph.prescription_date >= (p_year_month || '-01')::date
    AND ph.prescription_date < ((p_year_month || '-01')::date + interval '1 month')
  ))
  GROUP BY m.name
  ORDER BY SUM(pd.quantity) DESC;
END;
$$;
```

**Giải thích:** Thêm `ROUND(..., 2)` để triệt tiêu sai số floating-point (fix nhẹ Bug #7).

### Step 4: Verify — Kiểm tra kết quả sau migration

Chạy SQL kiểm tra:

```sql
-- So sánh trước/sau
SELECT 
  get_monthly_revenue_total() as new_revenue,
  (SELECT COALESCE(SUM(total_amount), 0) 
   FROM prescriptions_header 
   WHERE prescription_date >= date_trunc('month', CURRENT_DATE)) as old_revenue;
-- Expected: new_revenue > old_revenue (bao gồm consultation_fee)
```

## Files to Modify
- Database: RPC `get_monthly_revenue_total` (via Supabase migration)
- Database: RPC `get_revenue_stats` (via Supabase migration)
- Database: RPC `get_medicine_usage_stats` (via Supabase migration)
- **KHÔNG cần sửa frontend** — frontend đã gọi đúng RPC, chỉ RPC trả sai số

## Test Criteria
- [ ] `get_monthly_revenue_total()` trả về giá trị bao gồm cả `consultation_fee`
- [ ] StatsOverview card "Doanh thu tháng này" hiển thị đúng (tăng ~36% so với trước)
- [ ] Biểu đồ RevenueChart hiển thị doanh thu đúng (bao gồm phí khám)
- [ ] Đơn thuốc cũ (không có `consultation_fee`) vẫn tính đúng (COALESCE → 0)
- [ ] MedicineUsageTable hiển thị số tròn (VD: 3721.80 thay vì 3721.8000640869136)

## Rollback
Nếu migration lỗi, chạy lại RPC cũ (copy từ migration `008_statistics_rpcs` hoặc `012_fix_revenue_double_counting`).

---
Next Phase: → phase-02-fix-agegroup-rpcs.md
