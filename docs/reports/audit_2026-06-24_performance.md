# 🏥 Audit Report — Performance Focus
### Dự án: QLPK-SaaS | Ngày: 2026-06-24
### Bác sĩ: Khang (Security & Performance Engineer)

---

## Summary

| Mức độ | Số lượng |
|--------|----------|
| 🔴 Critical Issues | 3 |
| 🟡 Warnings | 5 |
| 🟢 Suggestions | 4 |

**Tình trạng chung:** Dự án đã được tối ưu **khá tốt** — sử dụng `Promise.all`, rollup tables, trigram indexes, React `cache()`, server-side pagination, và `dynamic()` imports. Tuy nhiên còn **một số triệu chứng** cần điều trị.

---

## 🔴 Critical Issues (Phải sửa ngay)

### 1. `getMedicinesForSearch()` — Load toàn bộ 1000 thuốc lên client

- **File:** [MedicineAutocomplete.tsx](file:///c:/Users/Administrator/Desktop/code/QLPK-SaaS-main/src/components/features/prescriptions/MedicineAutocomplete.tsx#L27-L48)
- **File action:** [medicines.ts](file:///c:/Users/Administrator/Desktop/code/QLPK-SaaS-main/src/actions/medicines.ts#L254-L274)

**Triệu chứng:** Mỗi khi mở form kê đơn, hệ thống tải **toàn bộ** danh sách thuốc (limit 1000) về client **1 lần duy nhất**, sau đó lọc bằng JavaScript trên client.

**Tại sao nguy hiểm:**
- Nếu phòng khám có 500-1000+ thuốc, response sẽ rất nặng (~50-100KB JSON)
- Tăng Time-to-Interactive (TTI) đáng kể trên thiết bị yếu
- Toàn bộ data được giữ trong memory trên client

**Phác đồ điều trị:**
- **Cách 1 (Tốt nhất):** Chuyển sang **debounced server-side search** — mỗi lần user gõ, gọi server action `getMedicines(query)` (đã có sẵn, line 211) kèm debounce 300ms
- **Cách 2 (Nhanh hơn):** Giảm limit xuống 200 + thêm virtual scrolling cho dropdown

---

### 2. `get_patients_with_last_visit` RPC — Full table scan khi không tìm kiếm

- **File:** [get_patients_with_last_visit.sql](file:///c:/Users/Administrator/Desktop/code/QLPK-SaaS-main/supabase/migrations/20260428194000_get_patients_with_last_visit.sql#L31-L69)

**Triệu chứng:** RPC này luôn chạy subquery `patient_visits` JOIN toàn bộ `prescriptions_header` rồi `GROUP BY patient_id` để lấy `MAX(prescription_date)`, **bất kể có search hay không**. Khi data lớn (10,000+ đơn thuốc), query này sẽ rất chậm.

**Tại sao nguy hiểm:**
- `patient_visits` CTE scan **toàn bộ** bảng `prescriptions_header` mỗi lần gọi
- `COUNT(*) OVER()` cho tổng số cũng tốn tài nguyên khi dataset lớn
- Không có index trên `prescriptions_header(patient_id, prescription_date)` cho GROUP BY

**Phác đồ điều trị:**
1. **Thêm composite index:**
   ```sql
   CREATE INDEX IF NOT EXISTS idx_rx_header_patient_date
   ON prescriptions_header(patient_id, prescription_date DESC);
   ```
2. **Materialized approach:** Thêm cột `last_visit_date` trực tiếp vào bảng `patients`, update bằng trigger (giống cách đã làm với `clinic_daily_stats`). Query sẽ nhanh gấp 10x.

---

### 3. `getMedicineUsageByPatient()` — N+1 Pattern tiềm ẩn + No pagination

- **File:** [patients.ts](file:///c:/Users/Administrator/Desktop/code/QLPK-SaaS-main/src/actions/patients.ts#L272-L312)

**Triệu chứng:** Hàm này lấy **toàn bộ** chi tiết đơn thuốc của bệnh nhân (không limit) rồi group bằng JavaScript. Bệnh nhân có 100+ đơn thuốc → hàng trăm records được load lên.

**Tại sao nguy hiểm:**
- Không có `LIMIT` → lấy tất cả records
- Group logic chạy trên application server thay vì database
- Memory usage cao khi lượng data lớn

**Phác đồ điều trị:**
- Chuyển sang **RPC hoặc raw SQL** với `GROUP BY medicine_id` trực tiếp trong database:
  ```sql
  SELECT pd.medicine_id, m.name, m.packing_spec, COUNT(*) as times_prescribed
  FROM prescription_details pd
  JOIN prescriptions_header ph ON pd.prescription_header_id = ph.id
  JOIN medicines m ON pd.medicine_id = m.id
  WHERE ph.patient_id = $1
  GROUP BY pd.medicine_id, m.name, m.packing_spec
  ORDER BY times_prescribed DESC
  LIMIT 20;
  ```

---

## 🟡 Warnings (Nên sửa)

### 4. `getPrescriptionsByPatient()` — Không có pagination

- **File:** [prescriptions.ts](file:///c:/Users/Administrator/Desktop/code/QLPK-SaaS-main/src/actions/prescriptions.ts#L62-L86)

**Triệu chứng:** Hàm này lấy **tất cả** đơn thuốc kèm chi tiết mà không có `LIMIT` hay `.range()`. Bệnh nhân khám lâu năm có thể có hàng trăm đơn.

> Lưu ý: `getPatientById()` đã giới hạn `limit(10)` + `getPatientPrescriptionsPaginated()` đã có pagination. Nhưng hàm `getPrescriptionsByPatient()` vẫn tồn tại và có thể bị gọi ở đâu đó.

**Phác đồ điều trị:** Thêm `.limit(50)` hoặc xóa hàm này nếu không còn sử dụng.

---

### 5. AI Dosage API — Gọi 2 lần Gemini API liên tiếp (No caching)

- **File:** [route.ts](file:///c:/Users/Administrator/Desktop/code/QLPK-SaaS-main/src/app/api/medicine-dosage/route.ts#L48-L198)

**Triệu chứng:** Mỗi request tra cứu liều thuốc = **2 lần gọi Gemini API** (Search + Format). Tổng timeout: 30s + 20s = 50s worst case. Không có **server-side cache**.

**Tại sao nguy hiểm:**
- Response time trung bình 3-8 giây (rất chậm)
- Cùng một thuốc tra cứu 10 lần → 20 lần gọi Gemini API (tốn quota)
- Client-side cache (trong hook) chỉ tồn tại trong session, mất khi reload

**Phác đồ điều trị:**
1. **Server-side cache** trong database (bảng `medicine_dosage_cache` với TTL 7 ngày)
2. Check cache trước khi gọi AI → giảm 90% API calls cho thuốc đã tra cứu

---

### 6. `useMedicineDosage` hook — `isLoading` trong dependency của `useCallback`

- **File:** [useMedicineDosage.ts](file:///c:/Users/Administrator/Desktop/code/QLPK-SaaS-main/src/hooks/useMedicineDosage.ts#L96)

**Triệu chứng:** `fetchDosage` callback phụ thuộc vào `isLoading` state → mỗi khi `isLoading` thay đổi, callback bị tạo lại → `useEffect` chạy lại → gọi fetch lại → **vòng lặp vô hạn tiềm ẩn**.

**Phác đồ điều trị:** Loại bỏ `isLoading` khỏi dependency array, dùng `ref` thay thế:
```typescript
const isLoadingRef = useRef(false);
// Trong fetchDosage:
if (isLoadingRef.current && lastFetchedName.current === cleanName) return;
```

---

### 7. `MedicineAutocomplete` — `JSON.stringify(excludeIds)` trong useMemo dependency

- **File:** [MedicineAutocomplete.tsx](file:///c:/Users/Administrator/Desktop/code/QLPK-SaaS-main/src/components/features/prescriptions/MedicineAutocomplete.tsx#L59)

**Triệu chứng:** `JSON.stringify(excludeIds)` chạy mỗi render → tạo string mới → `useMemo` recalculate mỗi render nếu array reference thay đổi.

**Phác đồ điều trị:** Dùng `excludeIds.join(',')` hoặc chuyển sang `useRef` lưu previous value.

---

### 8. Statistics page — Không cache data khi chuyển tab timeRange rồi quay lại

- **File:** [StatisticsClient.tsx](file:///c:/Users/Administrator/Desktop/code/QLPK-SaaS-main/src/components/features/statistics/StatisticsClient.tsx#L91-L134)

**Triệu chứng:** Khi chuyển từ "Ngày" → "Tuần" → quay lại "Ngày", data bị fetch lại 100%. Không có cache layer nào cho kết quả đã load.

**Phác đồ điều trị:** Thêm **client-side cache** bằng `useRef<Map>` hoặc `useSWR` để cache kết quả theo key `${timeRange}-${selectedMonth}`.

---

## 🟢 Suggestions (Tùy chọn — Làm được thì tốt)

### 9. `PrescriptionHistory.tsx` — File quá lớn (886 dòng / 43KB)

**Triệu chứng:** File này chứa quá nhiều logic: hiển thị, edit, delete, append, pagination, in ấn — tất cả trong 1 component.

**Phác đồ điều trị:** Tách thành các sub-components: `EditPrescriptionDialog`, `DeletePrescriptionDialog`, `AppendPrescriptionDialog`, `PrescriptionCard`.

---

### 10. `getRevenueStats()` — Group by Week/Month trên application server

- **File:** [statistics.ts](file:///c:/Users/Administrator/Desktop/code/QLPK-SaaS-main/src/actions/statistics.ts#L151-L214)

**Triệu chứng:** Dữ liệu daily stats được load raw rồi group by week/month bằng JavaScript.

**Phác đồ điều trị:** Tạo RPC group trực tiếp trong PostgreSQL → giảm payload size + nhanh hơn.

---

### 11. `@playwright/test` nằm trong `dependencies` thay vì `devDependencies`

- **File:** [package.json](file:///c:/Users/Administrator/Desktop/code/QLPK-SaaS-main/package.json#L15)

**Triệu chứng:** Playwright (testing lib nặng ~100MB) được install trong production build.

**Phác đồ điều trị:** Chuyển sang `devDependencies`.

---

### 12. Thiếu `next.config.js` / `next.config.ts`

**Triệu chứng:** Không tìm thấy file `next.config.*`. Nghĩa là Next.js chạy với config mặc định, không tận dụng được các tối ưu như:
- `experimental.optimizeCss`
- `images.formats: ['image/avif', 'image/webp']`
- `compress: true`

**Phác đồ điều trị:** Tạo `next.config.ts` với các tối ưu performance cơ bản.

---

## ✅ Những Điểm Đã Làm Tốt (Bệnh nhân khỏe mạnh 💪)

| Kỹ thuật | Triển khai | Đánh giá |
|----------|-----------|----------|
| **Server-side pagination** | `getPatientsPaginated`, `getAllMedicines`, `getPatientPrescriptionsPaginated` | ⭐⭐⭐⭐⭐ |
| **Parallel queries** | `Promise.all` trong `getPatientById`, `getOverviewStats` | ⭐⭐⭐⭐⭐ |
| **Rollup tables** | `clinic_daily_stats` + trigger tự động | ⭐⭐⭐⭐⭐ |
| **React cache()** | `getAuthUser`, `getPatientById`, `getAllMedicines`, `getLowStockMedicines` | ⭐⭐⭐⭐⭐ |
| **Dynamic imports** | Charts, MedicineAutocomplete, MedicineUsageDialog | ⭐⭐⭐⭐ |
| **Trigram indexes** | `pg_trgm` cho patients + medicines | ⭐⭐⭐⭐⭐ |
| **Debounce** | Patient search, medicine dosage lookup | ⭐⭐⭐⭐ |
| **useTransition** | Patient list navigation, medicine delete | ⭐⭐⭐⭐ |
| **useOptimistic** | Medicine list delete | ⭐⭐⭐⭐⭐ |
| **Abort controller** | Medicine dosage fetch cancellation | ⭐⭐⭐⭐ |
| **RPC atomic operations** | create_prescription, upsert_patient, merge_patients | ⭐⭐⭐⭐⭐ |

---

## Next Steps

Xem phần "Action Plan" trong output console.
