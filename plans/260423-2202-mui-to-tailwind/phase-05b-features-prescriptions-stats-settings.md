# Phase 05b: Feature Components - Prescriptions, Statistics, Settings, Dose Calculator
Status: ⬜ Pending
Dependencies: Phase 05a (Patient/Medicine patterns established)

## Objective
Chuyển đổi các feature components còn lại: **Đơn thuốc (Prescriptions)**, **Thống kê (Statistics)**, **Cài đặt (Settings)**, và **Tính liều (Dose Calculator)** từ MUI sang Tailwind CSS.

## Requirements
### Functional
- [ ] Prescription form: tạo đơn thuốc với autocomplete, bảng thuốc, thanh toán
- [ ] Statistics dashboard: charts, bộ lọc, overview cards, tables
- [ ] Settings form: cập nhật clinic info, đổi mật khẩu, toggle dark mode
- [ ] Dose calculator: tính liều thuốc, quản lý preset

### Non-Functional
- [ ] Recharts integration vẫn hoạt động (không phụ thuộc MUI)
- [ ] Glassmorphism card effect giữ nguyên
- [ ] react-hook-form integration không bị ảnh hưởng

## Implementation Steps

### Prescription Components

#### 1. MedicineAutocomplete.tsx (⚠️ PHỨC TẠP)
1. [ ] Rewrite `src/components/features/prescriptions/MedicineAutocomplete.tsx`:
   - **MUI removed**: `Autocomplete`, `TextField`
   - **Đây là component phức tạp nhất** vì MUI `Autocomplete` rất giàu tính năng
   - **Tailwind approach**: Custom combobox với:
     - Text input + dropdown suggestions
     - Keyboard navigation (arrow keys, Enter, Escape)
     - Debounced search
     - Highlight matching text
     - No results message
   - Hoặc sử dụng headless library: `@headlessui/react` `Combobox`

#### 2. PrescriptionForm.tsx
2. [ ] Rewrite `src/components/features/prescriptions/PrescriptionForm.tsx`:
   - **MUI removed**: `Box`, `Card`, `CardContent`, `Typography`, `TextField`, `Button`, `Table`, `TableBody`, `TableCell`, `TableContainer`, `TableHead`, `TableRow`, `Paper`, `Divider`, `Grid`, `Alert`, `CircularProgress`
   - **MUI icons removed**: `SaveIcon`, `AddIcon`, `ArrowBackIcon`
   - **Tailwind approach**:
     - 2-column layout: form (8/12) + summary (4/12)
     - Summary card dùng Glassmorphism effect
     - Gradient button cho "Lưu đơn thuốc"
   - **react-icons**: `HiOutlineArrowLeft`, `HiOutlinePlus`
   - **Lưu ý**: `CountUp` component (đã review Phase 03) được dùng ở đây

#### 3. PrescriptionItemRow.tsx
3. [ ] Rewrite `src/components/features/prescriptions/PrescriptionItemRow.tsx`:
   - **MUI removed**: Table cell components, TextField, IconButton
   - Row trong bảng thuốc: tên, số lượng (editable), đơn giá, thành tiền, nút xóa

### Statistics Components

#### 4. StatisticsClient.tsx
4. [ ] Rewrite `src/components/features/statistics/StatisticsClient.tsx`:
   - **MUI removed**: `Container`, `Grid`, `Typography`, `Box`, `Skeleton`
   - Main container orchestrating all stat components

#### 5. StatsOverview.tsx
5. [ ] Rewrite `src/components/features/statistics/StatsOverview.tsx`:
   - **MUI removed**: `Card`, `CardContent`, `Grid`, `Typography`, `Box`, `Skeleton`
   - **MUI icons removed**: `TrendingUpIcon`, `PeopleIcon`, `ReceiptIcon`, `AttachMoneyIcon`
   - 4 overview cards: tổng bệnh nhân, tổng đơn thuốc, doanh thu, lượt khám
   - **react-icons**: `HiOutlineTrendingUp`, `HiOutlineUsers`, `HiOutlineDocumentText`, `HiOutlineBanknotes`

#### 6. StatsFilter.tsx
6. [ ] Rewrite `src/components/features/statistics/StatsFilter.tsx`:
   - **MUI removed**: Various filter components (Select, TextField, etc.)
   - Date range picker + other filters

#### 7. RevenueChart.tsx
7. [ ] Rewrite `src/components/features/statistics/RevenueChart.tsx`:
   - **MUI removed**: `Card`, `CardContent`, `Typography`, `Box`
   - **Recharts**: giữ nguyên, chỉ đổi wrapper
   - Chuyển Card wrapper sang Tailwind

#### 8. VisitChart.tsx
8. [ ] Rewrite `src/components/features/statistics/VisitChart.tsx`:
   - Tương tự RevenueChart - chỉ đổi Card wrapper

#### 9. GenderPieChart.tsx
9. [ ] Rewrite `src/components/features/statistics/GenderPieChart.tsx`:
   - Tương tự RevenueChart - chỉ đổi Card wrapper

#### 10. AgeGroupChart.tsx
10. [ ] Rewrite `src/components/features/statistics/AgeGroupChart.tsx`:
    - Tương tự RevenueChart - chỉ đổi Card wrapper

#### 11. TopLocations.tsx
11. [ ] Rewrite `src/components/features/statistics/TopLocations.tsx`:
    - **MUI removed**: Table components + Card
    - Ranked list hoặc table

#### 12. MedicineUsageTable.tsx
12. [ ] Rewrite `src/components/features/statistics/MedicineUsageTable.tsx`:
    - **MUI removed**: Table components + Card
    - Data table

### Settings Component

#### 13. SettingsForm.tsx
13. [ ] Rewrite `src/components/features/settings/SettingsForm.tsx`:
    - **MUI removed**: `Box`, `Button`, `Card`, `CardContent`, `CardHeader`, `Divider`, `Grid`, `TextField`, `Typography`, `Switch`, `FormControlLabel`, `InputAdornment`, `CircularProgress`
    - **Tailwind approach**:
      - Card sections: Clinic info, Finance, Dark mode, Password change
      - Custom Switch/Toggle component
      - 2-column layout: settings (8/12) + password (4/12)

### Dose Calculator

#### 14. DoseCalculator.tsx
14. [ ] Rewrite `src/components/features/dose-calculator/DoseCalculator.tsx`:
    - Check MUI usage và migrate

#### 15. DrugPresetManager.tsx
15. [ ] Rewrite `src/components/features/dose-calculator/DrugPresetManager.tsx`:
    - Check MUI usage và migrate

## Files to Modify
| File | Complexity | Key Challenges |
|------|-----------|----------------|
| `src/components/features/prescriptions/MedicineAutocomplete.tsx` | 🔴 High | Custom combobox with keyboard nav |
| `src/components/features/prescriptions/PrescriptionForm.tsx` | 🔴 High | Complex layout + glassmorphism + gradient button |
| `src/components/features/prescriptions/PrescriptionItemRow.tsx` | 🟢 Low | Table row with editable cells |
| `src/components/features/statistics/StatisticsClient.tsx` | 🟡 Medium | Grid layout + skeleton loading |
| `src/components/features/statistics/StatsOverview.tsx` | 🟡 Medium | 4 stat cards + icons + skeleton |
| `src/components/features/statistics/StatsFilter.tsx` | 🟡 Medium | Date/select filters |
| `src/components/features/statistics/RevenueChart.tsx` | 🟢 Low | Card wrapper only |
| `src/components/features/statistics/VisitChart.tsx` | 🟢 Low | Card wrapper only |
| `src/components/features/statistics/GenderPieChart.tsx` | 🟢 Low | Card wrapper only |
| `src/components/features/statistics/AgeGroupChart.tsx` | 🟢 Low | Card wrapper only |
| `src/components/features/statistics/TopLocations.tsx` | 🟡 Medium | Card + Table |
| `src/components/features/statistics/MedicineUsageTable.tsx` | 🟡 Medium | Card + Table |
| `src/components/features/settings/SettingsForm.tsx` | 🟡 Medium | Multi-section form + toggle |
| `src/components/features/dose-calculator/DoseCalculator.tsx` | 🟡 Medium | TBD |
| `src/components/features/dose-calculator/DrugPresetManager.tsx` | 🟡 Medium | TBD |

## Autocomplete Strategy Decision

Cho `MedicineAutocomplete`, có 2 options:

### Option A: Build from scratch (Recommended if simple)
- Full control, no extra dependency
- Cần handle: search, dropdown, keyboard nav, selection
- ~100-150 lines code

### Option B: Use @headlessui/react Combobox
- Mature, accessible, headless (style với Tailwind)
- Cần `npm install @headlessui/react`
- Ít code hơn, battle-tested

**Recommendation**: Option B nếu cần keyboard navigation phức tạp, Option A nếu muốn giữ zero extra dependency.

## Test Criteria
- [ ] Prescription form tạo đơn thuốc thành công
- [ ] Medicine autocomplete search + select hoạt động
- [ ] Prescription item row: edit quantity, remove
- [ ] Total price tính đúng (CountUp animation)
- [ ] All statistics charts render đúng
- [ ] Stats filter thay đổi data đúng
- [ ] Settings form save thành công
- [ ] Password change hoạt động
- [ ] Dark mode toggle trong Settings hoạt động
- [ ] Dose calculator tính đúng
- [ ] Tất cả hoạt động trong Dark mode

## Notes
- **Statistics charts** (Recharts) không phụ thuộc MUI, chỉ cần đổi Card wrapper → rất nhanh.
- **MedicineAutocomplete** là thử thách lớn nhất vì MUI `Autocomplete` rất feature-rich.
- **SettingsForm** cần custom Toggle/Switch component - có thể tạo reusable.
- **Glassmorphism** effect trong PrescriptionForm đã có constants từ Phase 02.

---
Previous Phase: [phase-05a-features-patients-medicines.md](./phase-05a-features-patients-medicines.md)
Next Phase: [phase-06-pages-tests.md](./phase-06-pages-tests.md)
