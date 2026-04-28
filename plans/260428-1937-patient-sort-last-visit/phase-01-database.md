# Phase 01: Database Function
Status: ⬜ Pending
Dependencies: Không

## Objective
Tạo SQL function `get_patients_with_last_visit` trên Supabase để trả về danh sách bệnh nhân kèm ngày khám cuối cùng, đã sắp xếp theo lượt khám gần nhất.

## Phân tích Database hiện tại

### Bảng `patients` (236 rows)
```
id | name | dob | gender | address | phone | weight | medical_history | diagnosis | created_at | name_normalized | updated_at | clinic_id
```

### Bảng `prescriptions_header` (661 rows)
```
id | patient_id (FK → patients.id) | prescription_date (timestamptz) | diagnosis | total_amount | notes | consultation_fee | clinic_id
```

**Quan hệ:** 1 patient → nhiều prescriptions_header (qua `patient_id`)

## Implementation Steps

### 1. Tạo SQL Function `get_patients_with_last_visit`

```sql
CREATE OR REPLACE FUNCTION get_patients_with_last_visit(
  p_search_term TEXT DEFAULT NULL,
  p_search_normalized TEXT DEFAULT NULL,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  dob TEXT,
  gender TEXT,
  address TEXT,
  phone TEXT,
  weight TEXT,
  medical_history TEXT,
  diagnosis TEXT,
  created_at TIMESTAMPTZ,
  name_normalized TEXT,
  updated_at TIMESTAMPTZ,
  clinic_id BIGINT,
  last_visit_date TIMESTAMPTZ,
  total_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH patient_visits AS (
    SELECT 
      ph.patient_id,
      MAX(ph.prescription_date) AS last_visit_date
    FROM prescriptions_header ph
    GROUP BY ph.patient_id
  ),
  filtered_patients AS (
    SELECT p.*
    FROM patients p
    WHERE (
      p_search_term IS NULL 
      OR p_search_term = '' 
      OR p.name_normalized ILIKE '%' || p_search_normalized || '%'
      OR p.phone ILIKE '%' || p_search_term || '%'
    )
  )
  SELECT 
    fp.id,
    fp.name,
    fp.dob,
    fp.gender,
    fp.address,
    fp.phone,
    fp.weight,
    fp.medical_history,
    fp.diagnosis,
    fp.created_at,
    fp.name_normalized,
    fp.updated_at,
    fp.clinic_id,
    pv.last_visit_date,
    COUNT(*) OVER() AS total_count
  FROM filtered_patients fp
  LEFT JOIN patient_visits pv ON fp.id = pv.patient_id
  ORDER BY pv.last_visit_date DESC NULLS LAST, fp.id DESC
  LIMIT p_limit
  OFFSET p_offset;
$$;
```

**Giải thích logic:**
- **CTE `patient_visits`**: Tính `MAX(prescription_date)` cho mỗi patient → đây là ngày khám cuối cùng
- **CTE `filtered_patients`**: Lọc theo search term (tên hoặc SĐT) nếu có
- **LEFT JOIN**: Giữ lại cả bệnh nhân chưa có lượt khám nào (`last_visit_date = NULL`)
- **ORDER BY**: `last_visit_date DESC NULLS LAST` → khám gần nhất lên trên, chưa khám xuống cuối
- **`COUNT(*) OVER()`**: Trả về tổng số bệnh nhân (cho pagination) mà không cần query riêng

### 2. Chạy function trên Supabase

- [ ] Mở Supabase SQL Editor hoặc dùng `mcp_supabase_execute_sql`
- [ ] Chạy câu SQL ở trên
- [ ] Verify bằng query test:

```sql
-- Test: Lấy 5 bệnh nhân khám gần nhất
SELECT id, name, last_visit_date, total_count
FROM get_patients_with_last_visit(NULL, NULL, 5, 0);

-- Test: Tìm kiếm bệnh nhân
SELECT id, name, last_visit_date, total_count
FROM get_patients_with_last_visit('nguyen', 'nguyen', 5, 0);
```

## Files to Create/Modify
- Không có file code nào thay đổi ở phase này (chỉ tác động database)

## Test Criteria
- [ ] Function trả về đúng số lượng bệnh nhân
- [ ] `last_visit_date` khớp với `MAX(prescription_date)` trong `prescriptions_header`
- [ ] Bệnh nhân có `last_visit_date = NULL` nằm ở cuối danh sách
- [ ] Search term hoạt động đúng (theo tên normalized + SĐT)
- [ ] Pagination (`p_limit`, `p_offset`) hoạt động đúng
- [ ] `total_count` trả về đúng tổng số bệnh nhân sau khi lọc

## Rủi ro & Lưu ý
- ⚠️ `SECURITY DEFINER` nghĩa là function chạy với quyền của owner (thường là `postgres`) → cần đảm bảo RLS không bị bypass ngoài ý muốn. Nếu hệ thống dùng multi-clinic (clinic_id), cần thêm filter `WHERE p.clinic_id = ...` trong function.
- ⚠️ Nếu Supabase ở read-only mode (migration bị chặn), dùng `execute_sql` thay vì `apply_migration`.

---
Next Phase: → [Phase 02: Backend Update](./phase-02-backend.md)
