# Phase 05: Data Fetching Optimization (Pagination + Count)
Status: ✅ Completed
Dependencies: Phase 01 (RPCs)
Priority: 🟡 MEDIUM

## Objective
Tối ưu các query patterns: paginate nested relations trong `getPatientById`, thay `exact` count bằng `estimated` cho large tables, và tối ưu `getOverviewStats` monthly revenue.

## Issues Addressed
- **Issue #4:** Unbounded Nested Queries (MEDIUM)
- **Issue #5:** Exact Count Overhead (MEDIUM)

## Root Cause Analysis

### Unbounded Nested Queries:
```typescript
// HIỆN TẠI - getPatientById()
.select('*, prescriptions:prescriptions_header(*, prescription_details(*, medicines(name, packing_spec)))')
// Nếu patient khám 100 lần → massive JSON tree, slow response
```

### Exact Count:
```typescript
// HIỆN TẠI - getPatientsPaginated()
.select('*', { count: 'exact' })
// PostgreSQL phải scan toàn bộ matching rows để đếm chính xác
// Với 100K patients → COUNT(*) mất vài giây
```

## Requirements
### Functional
- [ ] `getPatientById`: Chỉ fetch N prescriptions gần nhất (mặc định 10)
- [ ] `getPatientsPaginated`: Dùng estimated count cho tables > 10K rows
- [ ] Prescription history: hỗ trợ "Load more" pattern
- [ ] `getOverviewStats`: Tối ưu monthly revenue calculation

### Non-Functional
- [ ] Response time cho patient detail page < 300ms
- [ ] Pagination response < 200ms

## Implementation Steps

1. [ ] **Paginate nested prescriptions trong `getPatientById`**
   ```typescript
   export async function getPatientById(id: number) {
     const supabase = await createClient();
     
     // Fetch patient info separately
     const { data: patient, error: pErr } = await supabase
       .from('patients')
       .select('*')
       .eq('id', id)
       .maybeSingle();
     
     if (pErr || !patient) return null;
     
     // Fetch prescriptions with limit + ordering
     const { data: prescriptions, error: rxErr } = await supabase
       .from('prescriptions_header')
       .select('*, prescription_details(*, medicines(name, packing_spec))')
       .eq('patient_id', id)
       .order('created_at', { ascending: false })
       .limit(10);
     
     return { ...patient, prescriptions: prescriptions || [] };
   }
   ```

2. [ ] **Tạo `getPatientPrescriptionsPaginated` cho "Load more"**
   ```typescript
   export async function getPatientPrescriptionsPaginated(
     patientId: number, 
     page: number = 1, 
     pageSize: number = 10
   ) {
     const supabase = await createClient();
     const from = (page - 1) * pageSize;
     const to = from + pageSize - 1;
     
     const { data, error, count } = await supabase
       .from('prescriptions_header')
       .select('*, prescription_details(*, medicines(name, packing_spec))', { count: 'exact' })
       .eq('patient_id', patientId)
       .order('created_at', { ascending: false })
       .range(from, to);
     
     return { data: data || [], count, hasMore: (count || 0) > to + 1 };
   }
   ```

3. [ ] **Switch to estimated count cho `getPatientsPaginated`**
   ```typescript
   export async function getPatientsPaginated(page: number, pageSize: number) {
     const supabase = await createClient();
     const from = (page - 1) * pageSize;
     const to = from + pageSize - 1;
     
     const { data, error, count } = await supabase
       .from('patients')
       .select('*', { count: 'estimated' })  // ← estimated thay vì exact
       .order('id', { ascending: false })
       .range(from, to);
     
     if (error) throw new Error('Failed to fetch patients');
     return { data: data as Patient[], count };
   }
   ```
   
   > **Note:** `estimated` dùng PostgreSQL `reltuples` từ `pg_class` → instant, nhưng có thể sai ±5%. Nếu cần chính xác hơn, cân nhắc giữ `exact` nhưng thêm cache.

4. [ ] **Giữ `exact` count cho `searchPatients`** (filtered queries cần chính xác)
   - `estimated` count không chính xác cho filtered queries
   - Nhưng với `pg_trgm` index (Phase 01), COUNT sẽ nhanh hơn nhiều

5. [ ] **Tối ưu `getOverviewStats` - monthly revenue**
   ```typescript
   // HIỆN TẠI: Fetch tất cả rows rồi reduce
   const monthlyRevenue = supabase.from('prescriptions_header')
     .select('total_amount, consultation_fee')
     .gte('prescription_date', start);
   const revenue = monthlyRevenue.data?.reduce(...);
   
   // TỐI ƯU: Dùng RPC hoặc computed column
   // Option A: Tạo RPC
   ```
   ```sql
   CREATE OR REPLACE FUNCTION get_monthly_revenue_total()
   RETURNS numeric AS $$
   BEGIN
     RETURN (
       SELECT COALESCE(SUM(total_amount + consultation_fee), 0)
       FROM prescriptions_header
       WHERE prescription_date >= date_trunc('month', CURRENT_DATE)
     );
   END;
   $$ LANGUAGE plpgsql STABLE;
   ```

6. [ ] **Cập nhật `PatientDetail.tsx`** - Hiển thị "Xem thêm" cho prescriptions
   - Thêm nút "Tải thêm đơn thuốc cũ" nếu có > 10 prescriptions
   - Gọi `getPatientPrescriptionsPaginated` khi bấm

7. [ ] **Cập nhật `PrescriptionHistory.tsx`** - Hỗ trợ paginated data
   - Accept `hasMore` prop
   - Render "Load more" button
   - Append new data khi user clicks

## Files to Create/Modify
- `src/actions/patients.ts` - Modify `getPatientById`, `getPatientsPaginated`, add `getPatientPrescriptionsPaginated`
- `src/actions/statistics.ts` - Modify `getOverviewStats` (monthly revenue RPC)
- `supabase/migrations/XXXXXX_monthly_revenue_rpc.sql` - Monthly revenue RPC
- `src/components/features/patients/PatientDetail.tsx` - Paginated prescriptions UI
- `src/components/features/patients/PrescriptionHistory.tsx` - "Load more" support

## Test Criteria
- [ ] Patient detail page loads in < 300ms (even with 100+ prescriptions)
- [ ] "Load more" button appears when patient has > 10 prescriptions
- [ ] Patient list pagination works with estimated count
- [ ] Overview stats monthly revenue matches actual SUM
- [ ] No regression in existing functionality

## Notes
- `estimated` count có thể cần `ANALYZE` chạy định kỳ trên Supabase để cập nhật statistics
- Nếu `estimated` quá sai lệch, fallback về `exact` với cache
- `getPatientById` hiện tại dùng cho patient detail page + prescription form → verify cả 2 flows

---
Previous Phase: [phase-04-frontend-performance.md](./phase-04-frontend-performance.md)
Next Phase: [phase-06-security-concurrency.md](./phase-06-security-concurrency.md)
