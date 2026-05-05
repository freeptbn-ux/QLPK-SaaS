# 🔍 BÁO CÁO LỖI LOGIC - MODULE THỐNG KÊ (Statistics)

> **Ngày phân tích:** 2026-05-05  
> **Phạm vi:** Toàn bộ module Thống kê (`/statistics`)  
> **Người phân tích:** Antigravity Detective  

---

## 📋 Tổng quan

Module Thống kê gồm các thành phần:
- **Server Actions:** `src/actions/statistics.ts`
- **Client Component:** `src/components/features/statistics/StatisticsClient.tsx`
- **Sub-components:** StatsOverview, StatsFilter, VisitChart, RevenueChart, GenderPieChart, AgeGroupChart, TopLocations, MedicineUsageTable
- **Database RPCs:** 13+ Postgres functions

---

## 🐛 Danh sách lỗi logic phát hiện

### Lỗi #1: 🔴 NGHIÊM TRỌNG — Doanh thu tháng THIẾU phí khám bệnh (consultation_fee)

| Mục | Chi tiết |
|-----|----------|
| **File** | RPC `get_monthly_revenue_total` + RPC `get_revenue_stats` |
| **Vấn đề** | Cả 2 RPC tính doanh thu chỉ dùng `total_amount` mà **BỎ QUA `consultation_fee`** |
| **Hậu quả** | Doanh thu hiển thị **THẤP HƠN thực tế** đáng kể |

**Bằng chứng SQL:**
```
Tháng 5/2026:
- Doanh thu KHÔNG tính phí khám: 2,743 đ
- Doanh thu CÓ tính phí khám:   4,303 đ  
- Tổng phí khám bị bỏ sót:      1,560 đ  (chiếm ~36% tổng doanh thu!)
```

**Code lỗi trong RPC `get_monthly_revenue_total`:**
```sql
-- ❌ Hiện tại:
SELECT COALESCE(SUM(total_amount), 0) FROM prescriptions_header ...

-- ✅ Nên sửa:
SELECT COALESCE(SUM(total_amount + COALESCE(consultation_fee, 0)), 0) FROM prescriptions_header ...
```

**Code lỗi trong RPC `get_revenue_stats`:**
```sql
-- ❌ Hiện tại:
SUM(COALESCE(total_amount, 0)::numeric) AS revenue

-- ✅ Nên sửa:
SUM(COALESCE(total_amount, 0) + COALESCE(consultation_fee, 0))::numeric AS revenue
```

> ⚠️ **CẢNH BÁO:** Lỗi này ảnh hưởng đến **cả StatsOverview card "Doanh thu tháng này"** và **biểu đồ RevenueChart**. Tất cả con số doanh thu hiển thị trên trang thống kê đều SAI (thấp hơn thực tế ~36%).

---

### Lỗi #2: 🔴 NGHIÊM TRỌNG — Biểu đồ Doanh thu KHÔNG hiển thị theo ngày khi chọn "Theo ngày"

| Mục | Chi tiết |
|-----|----------|
| **File** | `src/actions/statistics.ts` (dòng 130-147) + RPC `get_revenue_stats` |
| **Vấn đề** | Khi user chọn tab "Theo ngày", biểu đồ Lượt khám (VisitChart) hiển thị theo ngày (DD/MM), nhưng biểu đồ Doanh thu (RevenueChart) vẫn hiển thị **theo tháng (MM/YYYY)** |
| **Nguyên nhân** | RPC `get_revenue_stats` luôn GROUP BY `to_char(prescription_date, 'MM/YYYY')` bất kể tham số nào được truyền vào |

**Bằng chứng:**

Frontend gọi `getRevenueStats('day', '2026-05')`, nhưng RPC trả về:
```json
[{"name": "05/2026", "revenue": "2743"}]  // ← 1 record duy nhất, gộp cả tháng!
```

Trong khi Lượt khám (VisitChart) trả về chi tiết theo ngày:
```json
[{"name": "01/05", "revenue": "260"}, {"name": "02/05", "revenue": "640"}, ...]  // ← 5 records theo từng ngày
```

**Hậu quả:** Biểu đồ Doanh thu chỉ hiển thị **1 cột duy nhất** thay vì phân tích theo từng ngày, gây nhầm lẫn cho người dùng vì 2 biểu đồ cạnh nhau hiển thị ở 2 mức độ chi tiết khác nhau.

> ⚠️ Cần tạo thêm RPC mới hoặc sửa `get_revenue_stats` để hỗ trợ GROUP BY theo ngày, tuần, tháng, năm tương tự `get_stats_by_day_for_month`.

---

### Lỗi #3: 🔴 NGHIÊM TRỌNG — Biểu đồ Nhóm tuổi (AgeGroupChart) bị TRÙNG LẶP dữ liệu

| Mục | Chi tiết |
|-----|----------|
| **File** | RPC `get_patient_dobs_by_time` |
| **Vấn đề** | RPC JOIN `patients` với `prescriptions_header`, nên **1 bệnh nhân khám nhiều lần sẽ bị đếm nhiều lần** |
| **Hậu quả** | Biểu đồ phân bố nhóm tuổi bị **thổi phồng số liệu**, không phản ánh đúng thực tế |

**Bằng chứng:**
```
- Bệnh nhân "Trương Công Trường An" (DOB: 2023-08-29): 32 lượt khám
  → Bị đếm 32 lần trong nhóm "6 tháng-2 tuổi" thay vì 1 lần!
  
- Bệnh nhân "Nguyễn Phúc Khang" (DOB: 2024-12-11): 18 lượt khám
  → Bị đếm 18 lần!
```

**Code RPC lỗi:**
```sql
-- ❌ Hiện tại:
SELECT p.dob FROM prescriptions_header ph JOIN patients p ON p.id = ph.patient_id ...
-- Mỗi đơn thuốc = 1 bản ghi DOB → trùng lặp

-- ✅ Nên sửa (thêm DISTINCT):
SELECT DISTINCT p.dob FROM prescriptions_header ph JOIN patients p ON p.id = ph.patient_id ...
```

---

### Lỗi #4: 🔴 NGHIÊM TRỌNG — Biểu đồ Nhóm tuổi TRỐNG khi chọn "Theo tuần/tháng/năm"

| Mục | Chi tiết |
|-----|----------|
| **File** | `StatisticsClient.tsx` (dòng 94-114) + RPC `get_patient_dobs_by_time` |
| **Vấn đề** | Khi timeRange = `week`/`month`/`year`, frontend gọi `getPatientDobsByTime('all', '')` nhưng RPC **KHÔNG xử lý `p_filter_type = 'all'`** |

**Code RPC:**
```sql
IF p_filter_type = 'month' THEN ... 
ELSIF p_filter_type = 'year' THEN ...
END IF;
-- ❌ KHÔNG có nhánh cho 'all' → trả về EMPTY ARRAY!
```

**Bằng chứng:** Gọi `SELECT * FROM get_patient_dobs_by_time('all', '')` trả về **mảng rỗng `[]`**.

**Hậu quả:** Khi user chọn tab "Theo tuần", "Theo tháng", hoặc "Theo năm", biểu đồ Nhóm tuổi luôn **hiển thị trống hoàn toàn** (tất cả nhóm = 0).

> ❗ **QUAN TRỌNG:** Cần thêm nhánh `ELSE` hoặc `ELSIF p_filter_type = 'all'` trong RPC để trả về toàn bộ DOBs.

---

### Lỗi #5: 🟡 TRUNG BÌNH — Dữ liệu Gender & Location là TĨNH, không cập nhật theo filter

| Mục | Chi tiết |
|-----|----------|
| **File** | `StatisticsClient.tsx` (dòng 63-70) |
| **Vấn đề** | `genderData` và `locationData` được set 1 lần từ server props, **KHÔNG bao giờ fetch lại** khi user thay đổi tháng/timeRange |

**Code lỗi:**
```tsx
const [genderData] = useState<...>(initialGenderData);    // ← Không có setter!
const [locationData] = useState<...>(initialLocationData);  // ← Không có setter!
```

**Hậu quả:** 
- User chọn tháng 1/2026 hay tháng 5/2026, biểu đồ Gender & bảng Location **luôn hiển thị cùng dữ liệu** (tổng hợp toàn bộ thời gian).
- Đây có thể là **chủ đích** (hiển thị tổng quan), nhưng gây nhầm lẫn khi đặt cạnh các biểu đồ lọc theo tháng.

---

### Lỗi #6: 🟡 TRUNG BÌNH — 20 bệnh nhân có DOB legacy bị LOẠI khỏi biểu đồ Nhóm tuổi

| Mục | Chi tiết |
|-----|----------|
| **File** | `src/lib/utils/age.ts` + `AgeGroupChart.tsx` (dòng 32-33) |
| **Vấn đề** | `parseAgeParts()` chỉ nhận `DD/MM/YYYY` hoặc `YYYY-MM-DD`, nhưng database có 20 bệnh nhân với DOB dạng text như `"25 tuổi"`, `"7 tháng"`, `"5.5 tuổi"`, `"3,5 tuổi"`, `"không tuổi"` |

**Phân bố DOB trong database:**
```
ISO (YYYY-MM-DD): 218 bệnh nhân ✅
VN (DD/MM/YYYY):    2 bệnh nhân ✅
LEGACY/OTHER:      20 bệnh nhân ❌ (bị bỏ qua hoàn toàn)
```

**Ví dụ DOB legacy bị bỏ qua:**
```
"25 tuổi", "7 tháng", "15 tuổi", "14 tháng", "không tuổi", 
"5.5 tuổi", "6 tuổi", "3,5 tuổi", "5 tuổi", "18 tháng", ...
```

**Hậu quả:** ~8.3% bệnh nhân (20/240) bị loại khỏi thống kê nhóm tuổi. Biểu đồ không phản ánh đầy đủ phân bố tuổi thực tế.

---

### Lỗi #7: 🟢 NHẸ — Sai số floating-point trong doanh thu thuốc (MedicineUsageTable)

| Mục | Chi tiết |
|-----|----------|
| **File** | RPC `get_medicine_usage_stats` |
| **Vấn đề** | Cột `unit_price` dùng kiểu `real` (float4), phép tính `quantity * unit_price` sinh ra sai số floating-point |

**Bằng chứng:**
```
Cefdinir 125 DHG: totalRevenue = 3721.8000640869136  (thay vì 3721.80)
Dexanic:          totalRevenue = 75.320000320672885   (thay vì 75.32)
```

**Hậu quả:** Hiển thị OK nhờ `toLocaleString('vi-VN')` format, nhưng nếu tổng hợp nhiều giá trị, sai số có thể tích lũy.

---

### Lỗi #8: 🟡 TRUNG BÌNH — StatsOverview dùng `estimated` count cho Tổng bệnh nhân

| Mục | Chi tiết |
|-----|----------|
| **File** | `src/actions/statistics.ts` (dòng 157) |
| **Vấn đề** | `supabase.from('patients').select('*', { count: 'estimated', head: true })` dùng `estimated` count |

```tsx
// ❌ Hiện tại:
supabase.from('patients').select('*', { count: 'estimated', head: true })

// ✅ Nên sửa:
supabase.from('patients').select('*', { count: 'exact', head: true })
```

**Hậu quả:** Với 240 bệnh nhân, `estimated` thường khá chính xác. Nhưng khi dữ liệu lớn hơn (>10,000), giá trị `estimated` có thể sai lệch đáng kể so với `exact`. Đây là lựa chọn trade-off giữa tốc độ vs chính xác — nhưng trong bối cảnh phòng khám nhỏ (vài trăm → vài nghìn bệnh nhân), nên dùng `exact`.

---

## 📊 Bảng tổng hợp

| # | Mức độ | Lỗi | Ảnh hưởng | Component |
|---|--------|-----|-----------|-----------|
| 1 | 🔴 Nghiêm trọng | Thiếu consultation_fee trong doanh thu | Doanh thu thấp hơn ~36% | StatsOverview + RevenueChart |
| 2 | 🔴 Nghiêm trọng | Revenue chart không hỗ trợ view theo ngày | Biểu đồ chỉ 1 cột khi chọn "Theo ngày" | RevenueChart |
| 3 | 🔴 Nghiêm trọng | DOB trùng lặp vì JOIN không DISTINCT | Nhóm tuổi bị thổi phồng | AgeGroupChart |
| 4 | 🔴 Nghiêm trọng | RPC không xử lý filter_type='all' | Biểu đồ tuổi trống khi chọn tuần/tháng/năm | AgeGroupChart |
| 5 | 🟡 Trung bình | Gender & Location không lọc theo thời gian | Dữ liệu tĩnh, có thể gây nhầm lẫn | GenderPieChart + TopLocations |
| 6 | 🟡 Trung bình | 20 bệnh nhân DOB legacy bị bỏ qua | Mất ~8.3% dữ liệu nhóm tuổi | AgeGroupChart |
| 7 | 🟢 Nhẹ | Floating-point trong doanh thu thuốc | Sai số nhỏ, tích lũy khi tổng hợp | MedicineUsageTable |
| 8 | 🟡 Trung bình | Estimated count thay vì exact | Có thể sai lệch khi dữ liệu lớn | StatsOverview |

---

## 🎯 Đề xuất thứ tự ưu tiên sửa

1. **Lỗi #1** (consultation_fee) — Sửa 2 RPC trong database → **Impact cao nhất, effort thấp**
2. **Lỗi #4** (filter_type='all') — Thêm 1 nhánh ELSE vào RPC → **Effort rất thấp**
3. **Lỗi #3** (DISTINCT DOB) — Thêm DISTINCT vào RPC → **Effort rất thấp**
4. **Lỗi #2** (Revenue theo ngày) — Cần tạo/sửa RPC + sửa frontend → **Effort trung bình**
5. **Lỗi #8** (estimated → exact) — Đổi 1 tham số → **Effort rất thấp**
6. **Lỗi #6** (Legacy DOB) — Cần quyết định: migrate data hay hỗ trợ parse format cũ
7. **Lỗi #5** (Static gender/location) — Cần bàn thêm: có nên lọc theo thời gian không?
8. **Lỗi #7** (Floating-point) — Cân nhắc đổi `real` → `numeric` trong schema
