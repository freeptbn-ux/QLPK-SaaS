# Phase 03: Revenue Chart Multi-Granularity — Hỗ trợ ngày/tuần/tháng/năm

Status: ⬜ Pending
Dependencies: Phase 01 (Revenue RPC phải fix consultation_fee trước)
Fixes: Bug #2 (🔴 Nghiêm trọng)

## Objective

Sửa biểu đồ Doanh thu để hiển thị chi tiết theo ngày/tuần/tháng/năm, tương ứng với tab user chọn. Hiện tại biểu đồ luôn gộp theo tháng bất kể filter nào.

## Bằng chứng (từ thongke.md)

```
User chọn "Theo ngày" → VisitChart hiển thị 5 cột (5 ngày)
                       → RevenueChart chỉ hiển thị 1 cột (gộp cả tháng!)
```

## Analysis — Thiết kế solution

### Phương án A: Tạo 1 RPC mới `get_revenue_stats_v2` với tham số `p_granularity`
- ✅ Gom 4 loại query vào 1 RPC
- ✅ Dễ maintain
- ❌ Thay đổi lớn hơn

### Phương án B: Tạo 4 RPC riêng biệt (giống cách visit chart)
- ✅ Đơn giản, tương tự pattern đã có
- ❌ Nhiều RPC hơn

### **→ Chọn Phương án A** (gom vào 1 RPC mới, clean hơn)

## Implementation Steps

### Step 1: Tạo RPC mới `get_revenue_stats_v2`

```sql
CREATE OR REPLACE FUNCTION get_revenue_stats_v2(
  p_granularity text DEFAULT 'month',
  p_year_month text DEFAULT NULL,
  p_limit integer DEFAULT 12
)
RETURNS TABLE(name text, revenue numeric)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_granularity = 'day' THEN
    -- Doanh thu theo từng ngày trong 1 tháng cụ thể
    RETURN QUERY
    SELECT 
      to_char(prescription_date, 'DD/MM') AS name,
      SUM(
        COALESCE(total_amount, 0) + COALESCE(consultation_fee, 0)
      )::numeric AS revenue
    FROM prescriptions_header
    WHERE prescription_date >= (p_year_month || '-01')::date
      AND prescription_date < ((p_year_month || '-01')::date + interval '1 month')
    GROUP BY to_char(prescription_date, 'DD/MM'), prescription_date::date
    ORDER BY prescription_date::date ASC;

  ELSIF p_granularity = 'week' THEN
    -- Doanh thu theo tuần (N tuần gần nhất)
    RETURN QUERY
    SELECT 
      'W' || EXTRACT(WEEK FROM prescription_date)::text 
        || '/' || EXTRACT(YEAR FROM prescription_date)::text AS name,
      SUM(
        COALESCE(total_amount, 0) + COALESCE(consultation_fee, 0)
      )::numeric AS revenue
    FROM prescriptions_header
    GROUP BY EXTRACT(WEEK FROM prescription_date), EXTRACT(YEAR FROM prescription_date),
             DATE_TRUNC('week', prescription_date)
    ORDER BY DATE_TRUNC('week', prescription_date) DESC
    LIMIT p_limit;

  ELSIF p_granularity = 'year' THEN
    -- Doanh thu theo năm
    RETURN QUERY
    SELECT 
      EXTRACT(YEAR FROM prescription_date)::text AS name,
      SUM(
        COALESCE(total_amount, 0) + COALESCE(consultation_fee, 0)
      )::numeric AS revenue
    FROM prescriptions_header
    GROUP BY EXTRACT(YEAR FROM prescription_date)
    ORDER BY EXTRACT(YEAR FROM prescription_date) ASC;

  ELSE
    -- Mặc định: Doanh thu theo tháng (N tháng gần nhất)
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
    ORDER BY DATE_TRUNC('month', prescription_date) DESC
    LIMIT p_limit;
  END IF;
END;
$$;
```

**Giải thích:**
- Tham số `p_granularity`: `'day'` | `'week'` | `'month'` | `'year'`
- Tham số `p_year_month`: chỉ dùng khi `day` hoặc `month` (format `YYYY-MM`)
- Tham số `p_limit`: giới hạn số lượng kết quả cho week/month
- Tất cả nhánh đều tính `total_amount + consultation_fee` (đã fix Bug #1)
- Pattern GROUP BY tương tự các RPC visit đã hoạt động tốt

### Step 2: Cấp quyền cho RPC mới

```sql
GRANT EXECUTE ON FUNCTION get_revenue_stats_v2(text, text, integer) TO authenticated;
REVOKE EXECUTE ON FUNCTION get_revenue_stats_v2(text, text, integer) FROM anon;
```

### Step 3: Sửa Server Action `getRevenueStats` 

File: `src/actions/statistics.ts` (dòng 130-147)

```typescript
// TRƯỚC:
export async function getRevenueStats(timeRange: string = 'month', selectedMonth?: string) {
  const supabase = await createClient();
  const p_year_month = (timeRange === 'month' || timeRange === 'day') ? selectedMonth : null;
  const { data, error } = await supabase.rpc('get_revenue_stats', {
    p_year_month: p_year_month || null,
  });
  // ...
}

// SAU:
export async function getRevenueStats(timeRange: string = 'month', selectedMonth?: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc('get_revenue_stats_v2', {
    p_granularity: timeRange,
    p_year_month: (timeRange === 'day' || timeRange === 'month') ? (selectedMonth || null) : null,
    p_limit: timeRange === 'week' ? 8 : 12,
  });

  if (error) {
    console.error('Error fetching revenue stats:', error);
    throw new Error(error.message);
  }

  return data || [];
}
```

**Giải thích:**
- Đổi từ RPC cũ `get_revenue_stats` sang `get_revenue_stats_v2`
- Truyền `p_granularity` = `timeRange` (day/week/month/year)
- `p_year_month` chỉ truyền khi cần (day hoặc month filter)
- `p_limit`: week hiển thị 8 tuần, month hiển thị 12 tháng

### Step 4: (Optional) Cleanup — Xóa RPC cũ `get_revenue_stats`

Sau khi verify xong, có thể drop RPC cũ:
```sql
-- Chỉ chạy SAU KHI verify Phase 06 xong
-- DROP FUNCTION IF EXISTS get_revenue_stats(text);
```

> ⚠️ KHÔNG drop ngay, giữ lại để rollback nếu cần.

## Files to Modify
- Database: Tạo RPC `get_revenue_stats_v2` (via Supabase migration)
- `src/actions/statistics.ts` (dòng 130-147) — đổi sang gọi RPC mới

## Test Criteria
- [ ] Tab "Theo ngày": RevenueChart hiển thị cột theo từng ngày (DD/MM) — giống VisitChart
- [ ] Tab "Theo tuần": RevenueChart hiển thị 8 tuần gần nhất (W1/2026, W2/2026,...)
- [ ] Tab "Theo tháng": RevenueChart hiển thị 12 tháng gần nhất (01/2026, 02/2026,...)
- [ ] Tab "Theo năm": RevenueChart hiển thị theo năm (2025, 2026,...)
- [ ] Giá trị doanh thu đã bao gồm consultation_fee (verify với SQL)
- [ ] Chuyển tab không bị lỗi, loading smooth
- [ ] Tooltip hiển thị đúng format tiền Việt (VD: 4.303 đ)

## Notes

**Tại sao tạo RPC mới thay vì sửa RPC cũ?**
1. RPC cũ `get_revenue_stats` chỉ có 1 tham số `p_year_month` — không đủ để phân biệt granularity
2. Sửa signature RPC cũ sẽ break backward compatibility nếu có code khác gọi
3. Tạo mới an toàn hơn, có thể rollback dễ dàng

---
Next Phase: → phase-04-frontend-quick-fixes.md
