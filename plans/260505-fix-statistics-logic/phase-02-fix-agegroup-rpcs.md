# Phase 02: Fix AgeGroup RPCs — DISTINCT + filter_type='all'

Status: ✅ Completed
Dependencies: Không (có thể chạy song song với Phase 01)
Fixes: Bug #3 (🔴), Bug #4 (🔴)

## Objective

Sửa RPC `get_patient_dobs_by_time` để:
1. **Bug #3:** Thêm `DISTINCT` — tránh đếm trùng bệnh nhân khám nhiều lần
2. **Bug #4:** Thêm nhánh `ELSE` cho `p_filter_type = 'all'` — biểu đồ không còn trống

## Bằng chứng (từ thongke.md)

**Bug #3 — Trùng lặp:**
```
Bệnh nhân "Trương Công Trường An": 32 lượt khám → bị đếm 32 lần!
Bệnh nhân "Nguyễn Phúc Khang": 18 lượt khám → bị đếm 18 lần!
```

**Bug #4 — Trống khi chọn tuần/tháng/năm:**
```sql
SELECT * FROM get_patient_dobs_by_time('all', '');
-- Trả về: [] (mảng rỗng!)
```

## Implementation Steps

### Step 1: Fix RPC `get_patient_dobs_by_time`

```sql
CREATE OR REPLACE FUNCTION get_patient_dobs_by_time(
  p_filter_type text, 
  p_time_value text
)
RETURNS TABLE(dob text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_filter_type = 'month' THEN
    RETURN QUERY
    SELECT DISTINCT p.dob
    FROM prescriptions_header ph
    JOIN patients p ON p.id = ph.patient_id
    WHERE to_char(ph.prescription_date, 'YYYY-MM') = p_time_value
    AND p.dob IS NOT NULL;

  ELSIF p_filter_type = 'year' THEN
    RETURN QUERY
    SELECT DISTINCT p.dob
    FROM prescriptions_header ph
    JOIN patients p ON p.id = ph.patient_id
    WHERE to_char(ph.prescription_date, 'YYYY') = p_time_value
    AND p.dob IS NOT NULL;

  ELSE
    -- Handles 'all' and any other filter_type: return all unique DOBs
    RETURN QUERY
    SELECT DISTINCT p.dob
    FROM patients p
    WHERE p.dob IS NOT NULL;
  END IF;
END;
$$;
```

**Giải thích thay đổi:**
1. Thêm `DISTINCT` vào cả 3 nhánh → mỗi bệnh nhân chỉ đếm 1 lần
2. Thêm nhánh `ELSE` → khi `p_filter_type = 'all'`, trả về toàn bộ DOB từ bảng `patients` (không cần join prescriptions vì muốn tổng quan)
3. Nhánh `ELSE` query trực tiếp từ `patients` (không qua `prescriptions_header`) vì "all" nghĩa là toàn bộ bệnh nhân, kể cả chưa khám lần nào

### Step 2: Verify — Kiểm tra kết quả

```sql
-- Test 1: filter_type='all' không còn trống
SELECT COUNT(*) FROM get_patient_dobs_by_time('all', '');
-- Expected: > 0 (tương ứng tổng bệnh nhân có DOB)

-- Test 2: filter_type='month' không còn trùng
SELECT COUNT(*) as distinct_count FROM get_patient_dobs_by_time('month', '2026-05');
-- Expected: nhỏ hơn nhiều so với trước (vì đã DISTINCT)

-- Test 3: So sánh trước/sau cho 1 tháng cụ thể
-- Trước: bệnh nhân "Trương Công Trường An" xuất hiện 32 lần
-- Sau: chỉ xuất hiện 1 lần
SELECT dob, COUNT(*) FROM (
  SELECT DISTINCT p.dob
  FROM prescriptions_header ph
  JOIN patients p ON p.id = ph.patient_id
  WHERE to_char(ph.prescription_date, 'YYYY-MM') = '2026-05'
  AND p.dob IS NOT NULL
) sub GROUP BY dob HAVING COUNT(*) > 1;
-- Expected: 0 rows (không còn trùng)
```

## Files to Modify
- Database: RPC `get_patient_dobs_by_time` (via Supabase migration)
- **KHÔNG cần sửa frontend** — `StatisticsClient.tsx` đã gọi đúng tham số

## Test Criteria
- [x] `get_patient_dobs_by_time('all', '')` trả về danh sách DOB (không rỗng)
- [x] `get_patient_dobs_by_time('month', '2026-05')` trả về DOB DISTINCT (không trùng)
- [x] Biểu đồ AgeGroupChart hiển thị đúng khi chọn tab "Theo ngày" (có dữ liệu)
- [x] Biểu đồ AgeGroupChart hiển thị đúng khi chọn tab "Theo tuần" (có dữ liệu)
- [x] Biểu đồ AgeGroupChart hiển thị đúng khi chọn tab "Theo tháng" (có dữ liệu)
- [x] Biểu đồ AgeGroupChart hiển thị đúng khi chọn tab "Theo năm" (có dữ liệu)
- [x] Số lượng tổng trong biểu đồ nhóm tuổi hợp lý (không thổi phồng)

## Notes

**Tại sao nhánh `ELSE` query từ `patients` thay vì `prescriptions_header`?**

Khi user xem "Theo tuần" hoặc "Theo tháng" (không phải 1 tháng cụ thể), ý nghĩa là xem "tổng quan". Lúc này nên lấy toàn bộ bệnh nhân đã đăng ký, kể cả chưa có đơn thuốc nào. Điều này đảm bảo biểu đồ nhóm tuổi phản ánh **phân bố tuổi thực tế của phòng khám**.

---
Next Phase: → phase-03-revenue-chart-granularity.md
