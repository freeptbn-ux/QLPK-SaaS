# Phase 06: Statistics & Dose Calculator
Status: ✅ Completed
Completed At: 2026-04-23T09:21:00Z
Dependencies: Phase 05 (Prescription - cần data đơn thuốc)

## Objective
Xây dựng module thống kê (doanh thu, lượt khám, biểu đồ) và công cụ tính liều thuốc nhi khoa. Port từ `ui_stats_pyside.py` và `ui_dose_calculator_pyside.py`.

## Requirements

### Functional - Statistics
- [x] Thống kê lượt khám theo ngày (trong tháng)
- [x] Thống kê lượt khám theo tuần
- [x] Thống kê lượt khám theo tháng
- [x] Thống kê lượt khám theo năm
- [x] Thống kê doanh thu (tổng tiền đơn thuốc + phí khám)
- [x] Thống kê theo giới tính (pie chart)
- [x] Thống kê theo địa chỉ/khu vực (top 20)
- [x] Thống kê theo nhóm tuổi
- [x] Thống kê thuốc sử dụng nhiều nhất
- [x] Filter theo tháng/năm (dropdown chọn)

### Functional - Dose Calculator
- [x] Chọn thuốc mẫu (từ danh sách preset hoặc tự nhập)
- [x] Nhập hàm lượng (mg), thể tích (ml), liều chuẩn (mg/kg)
- [x] Nhập cân nặng bệnh nhân
- [x] Chọn chia liều: 1/2/3 lần/ngày
- [x] Kết quả: ml/lần và tổng ml/ngày
- [x] CRUD danh sách thuốc mẫu (lưu trên Supabase settings hoặc localStorage)

## Implementation Steps

### A. Statistics Server Actions
1. [x] Tạo `src/actions/statistics.ts`:
   ```typescript
   'use server'
   export async function getDistinctMonthsYears()
   export async function getStatsByDayForMonth(yearMonth: string)
   export async function getStatsByWeek(limit?: number)
   export async function getStatsByMonth(limit?: number)
   export async function getStatsByYear()
   export async function getStatsByGender()
   export async function getStatsByLocation(limit?: number)
   export async function getPatientDobsByTime(filterType: string, timeValue: string)
   export async function getMedicineUsageStats(yearMonth?: string)
   export async function getRevenueStats(yearMonth?: string)
   ```

### B. Statistics Page
2. [x] Tạo `src/app/(dashboard)/statistics/page.tsx`:
   - Server Component: fetch available months/years
   - Pass xuống client components

3. [x] Tạo `src/components/features/statistics/StatsOverview.tsx`:
   - Summary cards ở trên (MUI Card):
     - Tổng bệnh nhân
     - Lượt khám tháng này
     - Doanh thu tháng này
     - Thuốc sắp hết
   - Mỗi card có icon + số + trend indicator

4. [x] Tạo `src/components/features/statistics/VisitChart.tsx`:
   - Recharts BarChart: lượt khám theo ngày trong tháng
   - Tooltip hiện ngày + số lượt
   - Responsive container

5. [x] Tạo `src/components/features/statistics/RevenueChart.tsx`:
   - Recharts LineChart: doanh thu theo tháng
   - Tooltip hiện tháng + số tiền

6. [x] Tạo `src/components/features/statistics/GenderPieChart.tsx`:
   - Recharts PieChart: phân bố giới tính
   - Labels + percentages

7. [x] Tạo `src/components/features/statistics/AgeGroupChart.tsx`:
   - Recharts BarChart: phân bố nhóm tuổi
   - Groups từ config:
     - 0-2 tháng, 2-6 tháng, 6 tháng-2 tuổi, 2-6 tuổi, 6-16 tuổi, Người lớn

8. [x] Tạo `src/components/features/statistics/TopLocations.tsx`:
   - MUI Table/List: top 20 địa chỉ
   - Columns: Địa chỉ, Số lượt

9. [x] Tạo `src/components/features/statistics/MedicineUsageTable.tsx`:
   - MUI Table: thuốc sử dụng nhiều nhất
   - Columns: Tên thuốc, Tổng SL, Tổng tiền
   - Filter theo tháng

10. [x] Tạo `src/components/features/statistics/StatsFilter.tsx`:
    - MUI Select: chọn tháng / năm
    - Tabs: Theo ngày | Theo tuần | Theo tháng | Theo năm
    - Auto-load data khi thay đổi filter

### C. Dose Calculator
11. [x] Tạo `src/app/(dashboard)/dose-calculator/page.tsx`:
    - Client component (interactive form)

12. [x] Tạo `src/components/features/dose-calculator/DoseCalculator.tsx`:
    - Drug preset dropdown (MUI Select)
    - Input fields:
      - Hàm lượng (mg)
      - Thể tích (ml)
      - Liều chuẩn (mg/kg)
      - Cân nặng bệnh nhân (kg)
    - Chia liều radio: 1 / 2 / 3 lần/ngày
    - "TÍNH NGAY" button
    - Result display: **X ml / lần** + Tổng: Y ml/ngày
    - Công thức: `total_ml = (dose_per_kg * weight * ml) / mg`
    - `ml_per_time = total_ml / times`

13. [x] Tạo `src/components/features/dose-calculator/DrugPresetManager.tsx`:
    - CRUD danh sách thuốc mẫu
    - Default presets (port từ Python):
      ```json
      [
        {"name": "ZT-Amox", "mg": 200, "ml": 5, "dose": 50},
        {"name": "Cefdinir", "mg": 125, "ml": 5, "dose": 14},
        {"name": "Bactirid", "mg": 100, "ml": 5, "dose": 8},
        {"name": "ZiUSA", "mg": 200, "ml": 5, "dose": 10},
        {"name": "Biseptol", "mg": 240, "ml": 5, "dose": 48}
      ]
      ```
    - Lưu vào `settings` table key = `drug_presets`

## Files to Create/Modify
- `src/actions/statistics.ts`
- `src/app/(dashboard)/statistics/page.tsx`
- `src/components/features/statistics/StatsOverview.tsx`
- `src/components/features/statistics/VisitChart.tsx`
- `src/components/features/statistics/RevenueChart.tsx`
- `src/components/features/statistics/GenderPieChart.tsx`
- `src/components/features/statistics/AgeGroupChart.tsx`
- `src/components/features/statistics/TopLocations.tsx`
- `src/components/features/statistics/MedicineUsageTable.tsx`
- `src/components/features/statistics/StatsFilter.tsx`
- `src/app/(dashboard)/dose-calculator/page.tsx`
- `src/components/features/dose-calculator/DoseCalculator.tsx`
- `src/components/features/dose-calculator/DrugPresetManager.tsx`

## Test Criteria

### Statistics
- [x] Summary cards hiện đúng số liệu
- [x] Bar chart lượt khám theo ngày hoạt động
- [x] Filter tháng/năm thay đổi → chart update
- [x] Pie chart giới tính hiện đúng tỷ lệ
- [x] Top locations hiện đúng
- [x] Medicine usage table hiện đúng
- [x] Revenue stats tính đúng
- [x] Responsive: charts scale đúng trên mobile

### Dose Calculator
- [x] Chọn thuốc mẫu → fill đúng mg, ml, dose
- [x] Tính liều đúng công thức
- [x] Chia 1/2/3 lần → kết quả thay đổi đúng
- [x] Thêm/sửa/xóa thuốc mẫu hoạt động
- [x] Lỗi input (chữ, 0, âm) → hiện error message
- [x] Cân nặng pre-fill từ patient (nếu mở từ patient detail)

## Notes
- **Recharts**: Import dynamic `{ ssr: false }` vì charts dùng SVG DOM
- **Age group calculation**: Dùng `dob` field. Nếu dob dạng "13 tháng" → parse thủ công. Nếu dạng date → tính bình thường
- **Revenue**: `sum(total_amount)` từ `prescriptions_header` + `consultation_fee * count`
- **Drug presets**: Lưu dưới dạng JSON string trong `settings` table, key = `drug_presets`
- Port logic thống kê 1:1 từ `ui_stats_pyside.py` → TypeScript

---
Previous Phase: ← [phase-05-prescription.md](./phase-05-prescription.md)
Next Phase: → [phase-07-settings-deploy.md](./phase-07-settings-deploy.md)
