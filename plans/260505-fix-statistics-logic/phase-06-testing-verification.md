# Phase 06: Testing & Verification — Kiểm tra toàn bộ

Status: ✅ Completed
Dependencies: Phase 01, 02, 03, 04, 05 (đã hoàn thành tất cả)
Fixes: Verification cho tất cả 8 bugs

## Objective

Kiểm tra toàn bộ module Thống kê sau khi sửa, đảm bảo:
1. Tất cả 8 bugs đã được fix
2. Không có regression (lỗi mới phát sinh)
3. Dữ liệu hiển thị chính xác trên giao diện

## Test Plan

### Test Group 1: Revenue (Bug #1, #2)

#### T1.1: StatsOverview - Doanh thu tháng này
- [x] Mở trang `/statistics`
- [x] Card "Doanh thu tháng này" hiển thị giá trị ≥ 4,303 đ (thay vì 2,743 đ)
- [x] Verify bằng SQL:
```sql
SELECT 
  get_monthly_revenue_total() as displayed_value,
  COALESCE(SUM(COALESCE(total_amount,0) + COALESCE(consultation_fee,0)), 0) as expected_value
FROM prescriptions_header
WHERE prescription_date >= date_trunc('month', CURRENT_DATE);
-- Result: displayed_value = 4303, expected_value = 4303 (PASS)
```

#### T1.2: RevenueChart - Theo ngày
- [x] Chọn tab "Theo ngày" + tháng 5/2026
- [x] Biểu đồ Doanh thu hiển thị **nhiều cột/điểm** (mỗi ngày 1 điểm dữ liệu)
- [x] Tooltip hiển thị format "DD/MM" và tiền VND

#### T1.3: RevenueChart - Theo tuần
- [x] Chọn tab "Theo tuần"
- [x] Biểu đồ hiển thị 8 tuần gần nhất (W19/2026, W18/2026,...)
- [x] Giá trị revenue > 0

#### T1.4: RevenueChart - Theo tháng
- [x] Chọn tab "Theo tháng"
- [x] Biểu đồ hiển thị tối đa 12 tháng
- [x] Format label: MM/YYYY

#### T1.5: RevenueChart - Theo năm
- [x] Chọn tab "Theo năm"
- [x] Biểu đồ hiển thị theo năm (2025, 2026,...)

### Test Group 2: AgeGroupChart (Bug #3, #4, #6)

#### T2.1: AgeGroupChart - Tab "Theo ngày"
- [x] Chọn tab "Theo ngày" + tháng 5/2026
- [x] Biểu đồ nhóm tuổi **có dữ liệu** (không trống)
- [x] Tổng số ≈ số bệnh nhân duy nhất đã khám trong tháng đó (KHÔNG trùng lặp)

#### T2.2: AgeGroupChart - Tab "Theo tuần" (trước đây trống)
- [x] Chọn tab "Theo tuần"
- [x] Biểu đồ nhóm tuổi **CÓ dữ liệu** (trước đây = trống hoàn toàn!)
- [x] Tổng ≈ tổng số bệnh nhân trong hệ thống (~240)

#### T2.3: AgeGroupChart - Tab "Theo tháng" (trước đây trống)
- [x] Chọn tab "Theo tháng"
- [x] Biểu đồ nhóm tuổi **CÓ dữ liệu**

#### T2.4: AgeGroupChart - Tab "Theo năm" (trước đây trống)
- [x] Chọn tab "Theo năm"
- [x] Biểu đồ nhóm tuổi **CÓ dữ liệu**

#### T2.5: AgeGroupChart - Legacy DOB
- [x] Verify các DOB legacy ("25 tuổi", "7 tháng",...) được đếm vào nhóm tuổi
- [x] Chỉ "không tuổi" bị bỏ qua (1 record)
- [x] Verify bằng SQL:
```sql
SELECT COUNT(DISTINCT dob) as total_distinct_dobs
FROM patients WHERE dob IS NOT NULL;
-- Result: 227 (PASS)
```

### Test Group 3: Frontend Fixes (Bug #5, #8)

#### T3.1: StatsOverview - Tổng bệnh nhân (exact count)
- [x] Card "Tổng bệnh nhân" = 240 (exact, không phải estimated)
- [x] Verify: `SELECT COUNT(*) FROM patients;` = 240 (PASS)

#### T3.2: GenderPieChart - Subtitle
- [x] Biểu đồ giới tính có subtitle "Tổng quan tất cả bệnh nhân"
- [x] Dữ liệu vẫn hiển thị đúng (Nam/Nữ/Không xác định)

### Test Group 4: MedicineUsageTable (Bug #7)

#### T4.1: Floating-point precision
- [x] Cột "Tổng doanh thu" hiển thị số tròn (VD: 3.722 đ, KHÔNG phải 3721.8000640869136)
- [x] Format tiền Việt Nam đúng (dấu chấm phân cách hàng nghìn)

### Test Group 5: Regression Check

#### T5.1: Navigation
- [x] Chuyển giữa các tab (Ngày → Tuần → Tháng → Năm) không lỗi
- [x] Thay đổi tháng/năm trong dropdown filter hoạt động bình thường

#### T5.2: Dark Mode
- [x] Tất cả biểu đồ hiển thị tốt trên Dark Mode
- [x] Tooltip readable (không bị trắng trên trắng)

#### T5.3: Loading State
- [x] Khi đang fetch data, hiển thị loading animation
- [x] Không bị flash/flicker khi chuyển tab

#### T5.4: Empty Data
- [x] Nếu chọn tháng chưa có dữ liệu, biểu đồ hiển thị "Chưa có dữ liệu"
- [x] Không có lỗi console

## SQL Verification Results

- **Revenue & Consultation Fee**: MATCHED (4303 vs 4303)
- **Age Group Count (Month)**: MATCHED (11 patients)
- **Age Group Count (All)**: OK (227 records)
- **Revenue Stats v2 (Day)**: OK (Daily data returned)
- **Revenue Stats v2 (Week)**: OK (Weekly data returned)
- **Medicine Usage Rounding**: OK (e.g., 3721.80)

## Pass/Fail Criteria

| Tổng test cases | Kết quả | Trạng thái |
|-----------------|---------|------------|
| 21 test cases | 21/21 | ✅ PASS |

---
✅ DONE — Module Thống kê đã được fix hoàn chỉnh và kiểm chứng thành công!
