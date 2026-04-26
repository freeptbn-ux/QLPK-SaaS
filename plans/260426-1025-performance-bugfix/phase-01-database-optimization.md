# Phase 01: Database Optimization (SQL RPCs + Indexes)
Status: ✅ DONE
Dependencies: None (Foundation phase)
Priority: 🔴 CRITICAL

## Objective
Chuyển toàn bộ logic aggregation từ JavaScript (Node.js) xuống PostgreSQL. Tạo SQL RPCs thay thế cho 9 functions trong `statistics.ts` đang fetch-all rồi group bằng JS. Thêm GIN indexes cho full-text search.

## Issues Addressed
- **Issue #1:** O(N) In-Memory Data Aggregation (CRITICAL)
- **Issue #3:** Full Table Scan via leading wildcards (HIGH)
- **Issue #6:** N+1 Query pattern `.in()` array (MEDIUM)

## Root Cause Analysis
Hiện tại `statistics.ts` có 9 functions đều theo pattern:
```
1. SELECT tất cả rows (không có aggregation)
2. Truyền toàn bộ data qua network về Node.js
3. Iterate bằng JS (dayjs loops, Map, Record) để group/count
```
Khi database có 50,000+ prescriptions → OOM, timeout, network saturation.

## Requirements
### Functional
- [x] Tạo 7 SQL RPCs thay thế cho in-memory aggregation
- [x] Thêm `pg_trgm` extension và GIN indexes
- [x] Đảm bảo kết quả output giống y hệt format hiện tại

### Non-Functional
- [x] Performance: Queries phải < 100ms với 100K rows
- [x] Backward compatible: Không break UI hiện tại

## Implementation Steps

### A. Tạo SQL RPCs (Supabase SQL Editor)

1. [x] **RPC: `get_stats_by_day_for_month`** - Thay thế `getStatsByDayForMonth()`
   ```sql
   CREATE OR REPLACE FUNCTION get_stats_by_day_for_month(p_year_month text)
   RETURNS TABLE(name text, count bigint) AS $$
   BEGIN
     RETURN QUERY
     SELECT 
       to_char(prescription_date, 'DD/MM') AS name,
       COUNT(*) AS count
     FROM prescriptions_header
     WHERE prescription_date >= (p_year_month || '-01')::date
       AND prescription_date < ((p_year_month || '-01')::date + interval '1 month')
     GROUP BY to_char(prescription_date, 'DD/MM'), prescription_date::date
     ORDER BY prescription_date::date ASC;
   END;
   $$ LANGUAGE plpgsql STABLE;
   ```

2. [x] **RPC: `get_stats_by_week`** - Thay thế `getStatsByWeek()`
   ```sql
   CREATE OR REPLACE FUNCTION get_stats_by_week(p_limit int DEFAULT 8)
   RETURNS TABLE(name text, count bigint) AS $$
   BEGIN
     RETURN QUERY
     SELECT 
       'W' || EXTRACT(WEEK FROM prescription_date)::text || '/' || EXTRACT(YEAR FROM prescription_date)::text AS name,
       COUNT(*) AS count
     FROM prescriptions_header
     GROUP BY EXTRACT(WEEK FROM prescription_date), EXTRACT(YEAR FROM prescription_date), 
              DATE_TRUNC('week', prescription_date)
     ORDER BY DATE_TRUNC('week', prescription_date) DESC
     LIMIT p_limit;
   END;
   $$ LANGUAGE plpgsql STABLE;
   ```

3. [x] **RPC: `get_stats_by_month`** - Thay thế `getStatsByMonth()`
   ```sql
   CREATE OR REPLACE FUNCTION get_stats_by_month(p_limit int DEFAULT 12)
   RETURNS TABLE(name text, count bigint) AS $$
   BEGIN
     RETURN QUERY
     SELECT 
       to_char(prescription_date, 'MM/YYYY') AS name,
       COUNT(*) AS count
     FROM prescriptions_header
     GROUP BY to_char(prescription_date, 'MM/YYYY'), DATE_TRUNC('month', prescription_date)
     ORDER BY DATE_TRUNC('month', prescription_date) DESC
     LIMIT p_limit;
   END;
   $$ LANGUAGE plpgsql STABLE;
   ```

4. [x] **RPC: `get_stats_by_year`** - Thay thế `getStatsByYear()`
   ```sql
   CREATE OR REPLACE FUNCTION get_stats_by_year()
   RETURNS TABLE(name text, count bigint) AS $$
   BEGIN
     RETURN QUERY
     SELECT 
       EXTRACT(YEAR FROM prescription_date)::text AS name,
       COUNT(*) AS count
     FROM prescriptions_header
     GROUP BY EXTRACT(YEAR FROM prescription_date)
     ORDER BY EXTRACT(YEAR FROM prescription_date) ASC;
   END;
   $$ LANGUAGE plpgsql STABLE;
   ```

5. [x] **RPC: `get_stats_by_gender`** - Thay thế `getStatsByGender()`
   ```sql
   CREATE OR REPLACE FUNCTION get_stats_by_gender()
   RETURNS TABLE(name text, value bigint) AS $$
   BEGIN
     RETURN QUERY
     SELECT 
       COALESCE(gender, 'Không xác định') AS name,
       COUNT(*) AS value
     FROM patients
     GROUP BY gender;
   END;
   $$ LANGUAGE plpgsql STABLE;
   ```

6. [x] **RPC: `get_stats_by_location`** - Thay thế `getStatsByLocation()`
   ```sql
   CREATE OR REPLACE FUNCTION get_stats_by_location(p_limit int DEFAULT 20)
   RETURNS TABLE(name text, count bigint) AS $$
   BEGIN
     RETURN QUERY
     SELECT 
       COALESCE(address, 'Không xác định') AS name,
       COUNT(*) AS count
     FROM patients
     GROUP BY address
     ORDER BY COUNT(*) DESC
     LIMIT p_limit;
   END;
   $$ LANGUAGE plpgsql STABLE;
   ```

7. [x] **RPC: `get_medicine_usage_stats`** - Thay thế `getMedicineUsageStats()` + fix N+1 `.in()`
   ```sql
   CREATE OR REPLACE FUNCTION get_medicine_usage_stats(p_year_month text DEFAULT NULL)
   RETURNS TABLE(name text, "totalQuantity" bigint, "totalRevenue" numeric) AS $$
   BEGIN
     RETURN QUERY
     SELECT 
       m.name,
       SUM(pd.quantity)::bigint AS "totalQuantity",
       SUM(pd.quantity * pd.unit_price) AS "totalRevenue"
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
   $$ LANGUAGE plpgsql STABLE;
   ```

8. [x] **RPC: `get_revenue_stats`** - Thay thế `getRevenueStats()`
   ```sql
   CREATE OR REPLACE FUNCTION get_revenue_stats(p_year_month text DEFAULT NULL)
   RETURNS TABLE(name text, revenue numeric) AS $$
   BEGIN
     RETURN QUERY
     SELECT 
       to_char(prescription_date, 'MM/YYYY') AS name,
       SUM(COALESCE(total_amount, 0) + COALESCE(consultation_fee, 0)) AS revenue
     FROM prescriptions_header
     WHERE (p_year_month IS NULL OR (
       prescription_date >= (p_year_month || '-01')::date
       AND prescription_date < ((p_year_month || '-01')::date + interval '1 month')
     ))
     GROUP BY to_char(prescription_date, 'MM/YYYY'), DATE_TRUNC('month', prescription_date)
     ORDER BY DATE_TRUNC('month', prescription_date) ASC;
   END;
   $$ LANGUAGE plpgsql STABLE;
   ```

9. [x] **RPC: `get_distinct_months_years`** - Thay thế `getDistinctMonthsYears()`
   ```sql
   CREATE OR REPLACE FUNCTION get_distinct_months_years()
   RETURNS TABLE(month text) AS $$
   BEGIN
     RETURN QUERY
     SELECT DISTINCT 
       to_char(prescription_date, 'YYYY-MM') AS month
     FROM prescriptions_header
     ORDER BY month DESC;
   END;
   $$ LANGUAGE plpgsql STABLE;
   ```

### B. Tạo Trigram Indexes

10. [x] **Enable pg_trgm extension**
    ```sql
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
    ```

11. [x] **Tạo GIN indexes cho patient search**
    ```sql
    CREATE INDEX IF NOT EXISTS idx_patients_name_trgm 
      ON patients USING gin (name_normalized gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS idx_patients_phone_trgm 
      ON patients USING gin (phone gin_trgm_ops);
    ```

### C. Update TypeScript Actions

12. [x] **Rewrite `statistics.ts`** - Thay thế toàn bộ 9 functions dùng `supabase.rpc()` thay vì fetch-all
    - Xóa `dayjs` imports (không cần nữa cho aggregation)
    - Mỗi function chỉ còn ~5 dòng: gọi RPC → return data

## Files to Create/Modify
- `supabase/migrations/XXXXXX_statistics_rpcs.sql` - Tất cả SQL RPCs
- `supabase/migrations/XXXXXX_trigram_indexes.sql` - pg_trgm + GIN indexes
- `src/actions/statistics.ts` - Rewrite toàn bộ dùng RPCs

## Test Criteria
- [x] Tất cả charts trên Statistics dashboard hiển thị đúng data
- [x] `EXPLAIN ANALYZE` trên search query không còn Seq Scan
- [x] Memory usage của Node.js không tăng khi load Statistics
- [x] Response time < 500ms cho tất cả statistics endpoints

## Notes
- Chạy SQL trong Supabase SQL Editor trước, test manually
- Giữ nguyên output format (name/count/value) để không break frontend
- `getOverviewStats()` đã tương đối tốt (dùng `count: 'exact'` với `head: true`), chỉ cần optimize phần `monthlyRevenue`
- `getPatientDobsByTime()` cần giữ nguyên (trả raw DOBs cho AgeGroupChart xử lý client-side)

---
Next Phase: [phase-02-server-action-hardening.md](./phase-02-server-action-hardening.md)
