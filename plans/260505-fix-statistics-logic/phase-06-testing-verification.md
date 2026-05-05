# Phase 06: Testing & Verification — Kiểm tra toàn bộ

Status: ⬜ Pending
Dependencies: Phase 01, 02, 03, 04, 05 (phải hoàn thành tất cả trước)
Fixes: Verification cho tất cả 8 bugs

## Objective

Kiểm tra toàn bộ module Thống kê sau khi sửa, đảm bảo:
1. Tất cả 8 bugs đã được fix
2. Không có regression (lỗi mới phát sinh)
3. Dữ liệu hiển thị chính xác trên giao diện

## Test Plan

### Test Group 1: Revenue (Bug #1, #2)

#### T1.1: StatsOverview - Doanh thu tháng này
- [ ] Mở trang `/statistics`
- [ ] Card "Doanh thu tháng này" hiển thị giá trị ≥ 4,303 đ (thay vì 2,743 đ)
- [ ] Verify bằng SQL:
```sql
SELECT 
  get_monthly_revenue_total() as displayed_value,
  COALESCE(SUM(COALESCE(total_amount,0) + COALESCE(consultation_fee,0)), 0) as expected_value
FROM prescriptions_header
WHERE prescription_date >= date_trunc('month', CURRENT_DATE);
-- displayed_value phải = expected_value
```

#### T1.2: RevenueChart - Theo ngày
- [ ] Chọn tab "Theo ngày" + tháng 5/2026
- [ ] Biểu đồ Doanh thu hiển thị **nhiều cột** (mỗi ngày 1 cột, tương tự VisitChart)
- [ ] Tooltip hiển thị format "DD/MM" và tiền VND

#### T1.3: RevenueChart - Theo tuần
- [ ] Chọn tab "Theo tuần"
- [ ] Biểu đồ hiển thị 8 tuần gần nhất (W18/2026, W17/2026,...)
- [ ] Giá trị revenue > 0

#### T1.4: RevenueChart - Theo tháng
- [ ] Chọn tab "Theo tháng"
- [ ] Biểu đồ hiển thị tối đa 12 tháng
- [ ] Format label: MM/YYYY

#### T1.5: RevenueChart - Theo năm
- [ ] Chọn tab "Theo năm"
- [ ] Biểu đồ hiển thị theo năm (2025, 2026,...)

### Test Group 2: AgeGroupChart (Bug #3, #4, #6)

#### T2.1: AgeGroupChart - Tab "Theo ngày"
- [ ] Chọn tab "Theo ngày" + tháng 5/2026
- [ ] Biểu đồ nhóm tuổi **có dữ liệu** (không trống)
- [ ] Tổng số ≈ số bệnh nhân duy nhất đã khám trong tháng đó (KHÔNG trùng lặp)

#### T2.2: AgeGroupChart - Tab "Theo tuần" (trước đây trống)
- [ ] Chọn tab "Theo tuần"
- [ ] Biểu đồ nhóm tuổi **CÓ dữ liệu** (trước đây = trống hoàn toàn!)
- [ ] Tổng ≈ tổng số bệnh nhân trong hệ thống (~240)

#### T2.3: AgeGroupChart - Tab "Theo tháng" (trước đây trống)
- [ ] Chọn tab "Theo tháng"
- [ ] Biểu đồ nhóm tuổi **CÓ dữ liệu**

#### T2.4: AgeGroupChart - Tab "Theo năm" (trước đây trống)
- [ ] Chọn tab "Theo năm"
- [ ] Biểu đồ nhóm tuổi **CÓ dữ liệu**

#### T2.5: AgeGroupChart - Legacy DOB
- [ ] Verify các DOB legacy ("25 tuổi", "7 tháng",...) được đếm vào nhóm tuổi
- [ ] Chỉ "không tuổi" bị bỏ qua (1 record)
- [ ] Verify bằng SQL:
```sql
SELECT COUNT(DISTINCT dob) as total_distinct_dobs
FROM patients WHERE dob IS NOT NULL;
-- Phải ≈ tổng trong biểu đồ (trừ 1 "không tuổi")
```

### Test Group 3: Frontend Fixes (Bug #5, #8)

#### T3.1: StatsOverview - Tổng bệnh nhân (exact count)
- [ ] Card "Tổng bệnh nhân" = 240 (exact, không phải estimated)
- [ ] Verify: `SELECT COUNT(*) FROM patients;` = 240

#### T3.2: GenderPieChart - Subtitle
- [ ] Biểu đồ giới tính có subtitle "Tổng quan tất cả bệnh nhân"
- [ ] Dữ liệu vẫn hiển thị đúng (Nam/Nữ/Không xác định)

### Test Group 4: MedicineUsageTable (Bug #7)

#### T4.1: Floating-point precision
- [ ] Cột "Tổng doanh thu" hiển thị số tròn (VD: 3.722 đ, KHÔNG phải 3721.8000640869136)
- [ ] Format tiền Việt Nam đúng (dấu chấm phân cách hàng nghìn)

### Test Group 5: Regression Check

#### T5.1: Navigation
- [ ] Chuyển giữa các tab (Ngày → Tuần → Tháng → Năm) không lỗi
- [ ] Thay đổi tháng/năm trong dropdown filter hoạt động bình thường

#### T5.2: Dark Mode
- [ ] Tất cả biểu đồ hiển thị tốt trên Dark Mode
- [ ] Tooltip readable (không bị trắng trên trắng)

#### T5.3: Loading State
- [ ] Khi đang fetch data, hiển thị loading animation
- [ ] Không bị flash/flicker khi chuyển tab

#### T5.4: Empty Data
- [ ] Nếu chọn tháng chưa có dữ liệu, biểu đồ hiển thị "Chưa có dữ liệu"
- [ ] Không có lỗi console

## SQL Verification Script

Chạy toàn bộ script này sau khi deploy để verify:

```sql
-- 1. Revenue bao gồm consultation_fee
SELECT 
  get_monthly_revenue_total() as monthly_revenue,
  (SELECT SUM(COALESCE(total_amount,0) + COALESCE(consultation_fee,0)) 
   FROM prescriptions_header 
   WHERE prescription_date >= date_trunc('month', CURRENT_DATE)) as expected;

-- 2. DOBs không trùng khi filter_type='month'
SELECT COUNT(*) as count FROM get_patient_dobs_by_time('month', '2026-05');
SELECT COUNT(DISTINCT p.dob) as expected 
FROM prescriptions_header ph 
JOIN patients p ON p.id = ph.patient_id 
WHERE to_char(ph.prescription_date, 'YYYY-MM') = '2026-05' AND p.dob IS NOT NULL;

-- 3. DOBs có dữ liệu khi filter_type='all'
SELECT COUNT(*) as all_dobs FROM get_patient_dobs_by_time('all', '');
-- Expected: > 200

-- 4. Revenue stats v2 theo ngày
SELECT * FROM get_revenue_stats_v2('day', '2026-05');
-- Expected: nhiều rows (1 per day)

-- 5. Revenue stats v2 theo tuần
SELECT * FROM get_revenue_stats_v2('week', NULL, 8);
-- Expected: tối đa 8 rows

-- 6. Medicine usage ROUND
SELECT * FROM get_medicine_usage_stats() LIMIT 3;
-- Expected: totalRevenue là số tròn 2 chữ số thập phân
```

## Pass/Fail Criteria

| Tổng test cases | Phải pass để DONE |
|-----------------|-------------------|
| 21 test cases | ≥ 19/21 (90%) |

**Nếu fail bất kỳ test nào:**
- Revenue sai → rollback Phase 01/03 migration
- AgeGroup trống → rollback Phase 02 migration
- Frontend lỗi → git revert Phase 04/05 commits

---
✅ DONE — Module Thống kê đã được fix hoàn chỉnh!
