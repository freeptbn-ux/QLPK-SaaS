# 📊 Báo cáo Phân tích & Phản biện `load.md` + Đề xuất Cải thiện Tốc độ

> **Ngày phân tích**: 2026-05-07  
> **Đối tượng**: Trang `/patients/[id]` (Patient Detail Page)  
> **Phương pháp**: Đọc mã nguồn thực tế + chạy EXPLAIN ANALYZE trên DB production

---

## Phần 1: Đánh giá độ chính xác của `load.md`

### Nhận xét #1: "getPatientById được gọi 2 lần"

> **Kết luận: ✅ ĐÚNG, nhưng KHÔNG phải vấn đề lớn**

**Bằng chứng** (file `src/app/(dashboard)/patients/[id]/page.tsx`):
```tsx
// Lần 1: generateMetadata (line 14)
const patient = await getPatientById(Number(id));

// Lần 2: PatientPage component (line 23)
const patient = await getPatientById(Number(id));
```

**Tuy nhiên**, `getPatientById` đã được bọc bởi React `cache()` (line 71, `patients.ts`):
```tsx
export const getPatientById = cache(async (id: number) => { ... });
```

React `cache()` hoạt động **trong cùng một server request** — nghĩa là trong cùng 1 lần render, hàm chỉ thực sự gọi DB **1 lần duy nhất**, lần gọi thứ 2 sẽ trả về kết quả đã cache. **Đây KHÔNG phải bottleneck thực sự.**

Nhận xét của `load.md` rằng "tải quá nhiều dữ liệu dư thừa cho metadata" là **đúng về mặt lý thuyết** (metadata chỉ cần `name`), nhưng **vì cache(), nó không tạo thêm truy vấn DB nào** — do đó impact thực tế rất nhỏ, chỉ là thừa data trong memory của server.

---

### Nhận xét #2: "Truy vấn cồng kềnh — JOIN nhiều cấp"

> **Kết luận: ⚠️ ĐÚNG MỘT PHẦN, nhưng ĐÃ ĐƯỢC TỐI ƯU RỒI**

**Bằng chứng** (file `src/actions/patients.ts`, line 76-94):
```tsx
// Đã sử dụng Promise.all để chạy SONG SONG 2 queries
const [patientRes, rxRes] = await Promise.all([
  patientPromise,       // Query 1: SELECT * FROM patients WHERE id = X
  prescriptionsPromise  // Query 2: prescriptions_header + details + medicines
]);
```

`load.md` nói "đang thực hiện JOIN nhiều cấp" nhưng thực tế:
- Code **đã tách thành 2 query riêng biệt** chạy song song qua `Promise.all`
- Đây KHÔNG phải 1 query JOIN cồng kềnh mà là 2 query nhẹ chạy parallel

**Kết quả EXPLAIN ANALYZE thực tế** (patient_id=18, bệnh nhân có nhiều đơn thuốc nhất — 32 đơn):
```
Execution Time: 1.048 ms  (query prescriptions + details + medicines)
Execution Time: 0.173 ms  (query patient info)
```

Cả 2 queries chạy song song đều **dưới 2ms** — đây là tốc độ rất tốt. Load.md **nói quá** về mức độ "cồng kềnh" của truy vấn.

---

### Nhận xét #3: "Thiếu Streaming"

> **Kết luận: ✅ ĐÚNG**

**Bằng chứng**: Kiểm tra thư mục `src/app/(dashboard)/patients/[id]/`:
- Chỉ có `page.tsx` và thư mục `prescribe/`
- **KHÔNG có** `loading.tsx` riêng cho `[id]`
- **KHÔNG có** `<Suspense>` trong `page.tsx`

Trang hiện tại là **1 Server Component monolithic** — phải chờ cả `getPatientById` (gồm patient info + prescriptions) hoàn tất mới render.

---

### Nhận xét #4: "Thiếu Composite Index"

> **Kết luận: ✅ ĐÚNG**

**Bằng chứng — Indexes hiện có trên `prescriptions_header`**:
```
idx_prescriptions_header_patient_id  → btree (patient_id)           ← Index lẻ
idx_prescriptions_header_date        → btree (prescription_date)    ← Index lẻ
```

**Chưa có** composite index `(patient_id, prescription_date DESC)`.

EXPLAIN ANALYZE cho thấy Postgres đang **quét index date rồi filter patient_id**, thay vì dùng composite index tối ưu:
```
Index Scan Backward using idx_prescriptions_header_date 
  Filter: (patient_id = 18)
  Rows Removed by Filter: 167     ← Quét 167 dòng thừa để lọc!
```

Với composite index, Postgres sẽ nhảy thẳng vào đúng patient_id rồi scan date — **zero rows removed by filter**.

---

### Nhận xét #5: "Loading UI chưa tối ưu"

> **Kết luận: ✅ ĐÚNG**

**Bằng chứng** (file `src/app/(dashboard)/patients/loading.tsx`):
```tsx
export default function PatientsLoading() {
  return <LoadingReporter text="Đang tải danh sách bệnh nhân..." />;
}
```

Loading text **"Đang tải danh sách bệnh nhân..."** không phù hợp với trang chi tiết 1 bệnh nhân. Thư mục `[id]/` không có `loading.tsx` riêng.

---

## Phần 2: Những vấn đề `load.md` CHƯA ĐỀ CẬP

### 🔴 Vấn đề #6: Auth overhead — `supabase.auth.getUser()` gọi quá nhiều lần

**Đây là bottleneck ẩn lớn nhất mà `load.md` bỏ sót.**

Khi load trang `/patients/[id]`, chuỗi gọi auth diễn ra như sau:

1. `DashboardLayout` → `getAllSettings()` → `createClient()` + `auth.getUser()` **(~50-100ms network)**
2. `page.tsx` → `getPatientById()` → `createClient()` + `auth.getUser()` **(~50-100ms network)**

Mỗi lần `auth.getUser()` gửi **1 HTTP request tới Supabase Auth server** để verify token. Trên mạng tốt mất ~50ms, mạng chậm có thể ~200ms.

Tổng overhead auth trong 1 page load: **ít nhất ~100-200ms** chỉ để xác thực user — chiếm phần lớn thời gian load.

> **Lưu ý**: `cache()` của React KHÔNG cache qua các function khác nhau (`getAllSettings` vs `getPatientById`). Mỗi server action tạo Supabase client riêng → gọi auth riêng.

---

### 🔴 Vấn đề #7: Dashboard Layout — `getAllSettings()` block mọi trang

**Bằng chứng** (file `src/app/(dashboard)/layout.tsx`):
```tsx
export default async function DashboardLayout({ children }) {
  const settings = await getAllSettings()  // ← BLOCK: phải xong trước khi render children
  return (
    <SettingsProvider initialSettings={settings}>
      <DashboardShell>{children}</DashboardShell>
    </SettingsProvider>
  )
}
```

`getAllSettings()` là 1 async call **chặn toàn bộ layout** — mọi page bên trong (bao gồm `/patients/[id]`) phải **đợi settings load xong** mới bắt đầu render. Đây là overhead cố định cho **tất cả các trang dashboard**.

---

### 🟡 Vấn đề #8: Không có middleware.ts

Dự án hiện tại **không có middleware.ts** — nghĩa là không có session refresh ở tầng middleware. Điều này có 2 hệ quả:
1. Token refresh phải xảy ra ở mỗi server action → tăng thêm latency
2. Có nguy cơ token hết hạn giữa chừng nếu session idle lâu

---

### 🟡 Vấn đề #9: `PatientDetail` là Client Component render nặng

**Bằng chứng**: `PatientDetail.tsx` là `'use client'` component **import rất nhiều** sub-components:
- `PrescriptionHistory` (885 lines!)
- `PatientFormDialog`
- `ConfirmDialog`
- `framer-motion` (AnimatePresence, motion)
- `dayjs`, `react-icons`, `MedicineAutocomplete`...

Toàn bộ JS bundle cho component này phải được **download và hydrate** trên client. PrescriptionHistory.tsx **đặc biệt nặng** (885 lines, nhiều dialog, animation).

---

## Phần 3: Đề xuất Cải thiện (Không sửa code)

Dưới đây là các đề xuất cải thiện, sắp xếp theo **impact/effort ratio** từ cao xuống thấp:

### 🏆 Ưu tiên 1: Thêm Composite Index (Effort: Rất thấp | Impact: Trung bình → Cao khi data lớn)

```sql
CREATE INDEX CONCURRENTLY idx_prescriptions_patient_date 
ON prescriptions_header (patient_id, prescription_date DESC);
```

**Tại sao**: Hiện tại Postgres quét ngược index `prescription_date` rồi filter `patient_id`, loại bỏ ~167 rows thừa. Composite index sẽ giảm I/O xuống gần 0. Với 681 prescriptions hiện tại thì chưa thấy rõ (1ms), nhưng khi data tăng lên 10K-100K records, sự khác biệt sẽ **rất đáng kể** (có thể 10-100x).

---

### 🏆 Ưu tiên 2: Tạo `loading.tsx` riêng cho `[id]` (Effort: Thấp | Impact: Cao)

Tạo file `src/app/(dashboard)/patients/[id]/loading.tsx` với Skeleton UI mô phỏng layout trang chi tiết:
- 4 cột thông tin cá nhân (skeleton blocks)
- 1 khối lịch sử đơn thuốc (skeleton list)

**Tại sao**: Hiện tại user thấy loading text "Đang tải danh sách bệnh nhân..." — không liên quan. Skeleton UI cho perceived performance tốt hơn nhiều.

---

### 🏆 Ưu tiên 3: Suspense cho Prescription History (Effort: Trung bình | Impact: Cao)

Tách data fetching:
1. `page.tsx` chỉ fetch patient basic info (rất nhanh, ~0.2ms DB time)
2. Wrap `PrescriptionHistory` trong `<Suspense>` với async server component riêng fetch prescriptions

**Tại sao**: Patient info hiện ra **gần như tức thì**, user có thể đọc thông tin cá nhân trong khi lịch sử đơn thuốc vẫn đang load.

---

### 🥈 Ưu tiên 4: Tối ưu Auth flow (Effort: Trung bình | Impact: Cao)

Có 3 cách tiếp cận:

**4a. Thêm middleware.ts cho session refresh**
- Xử lý token refresh ở middleware thay vì mỗi server action
- Giảm overhead auth trong data fetching functions

**4b. Tạo shared auth helper với `cache()`**
```tsx
// Ý tưởng: Dùng React cache() cho getUser để tránh gọi auth nhiều lần
const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});
```

**4c. Dùng `getSession()` thay `getUser()` cho read-only operations**
- `getSession()` đọc từ cookie, không gọi mạng
- `getUser()` verify token qua Supabase server (network call)
- Đối với read-only thì `getSession()` đủ an toàn, tiết kiệm ~50-100ms/call

---

### 🥈 Ưu tiên 5: Tối ưu Dashboard Layout (Effort: Trung bình | Impact: Trung bình)

**Settings có thể cache tích cực hơn** vì settings ít thay đổi:
- Dùng `unstable_cache` hoặc `revalidate` timer
- Hoặc fetch settings qua client-side với SWR/React Query + stale-while-revalidate

---

### 🥉 Ưu tiên 6: Dynamic Import cho PrescriptionHistory (Effort: Thấp | Impact: Trung bình)

```tsx
const PrescriptionHistory = dynamic(() => import('./PrescriptionHistory'), {
  loading: () => <PrescriptionSkeleton />,
  ssr: false  // Chỉ load trên client, giảm SSR payload
});
```

**Tại sao**: PrescriptionHistory.tsx (885 lines + framer-motion + dayjs + nhiều dialog) có JS bundle **rất nặng**. Dynamic import giúp main page JS load nhanh hơn, component prescriptions sẽ load riêng khi cần.

---

### 🥉 Ưu tiên 7: Lazy Load Prescription Details (Effort: Cao | Impact: Trung bình)

Đúng như `load.md` đề xuất — chỉ fetch `prescriptions_header` ban đầu, fetch `prescription_details + medicines` khi user expand. Tuy nhiên, với data hiện tại (trung bình ~3-4 details/prescription, tối đa 10 prescriptions = ~40 rows), impact chưa đáng kể.

---

## Phần 4: Tổng kết

### So sánh `load.md` vs Thực tế

| # | Nhận xét trong `load.md` | Đánh giá | Ghi chú |
|---|--------------------------|----------|---------|
| 1 | getPatientById gọi 2 lần | ✅ Đúng nhưng không ảnh hưởng | React `cache()` xử lý rồi |
| 2 | Truy vấn "cồng kềnh" | ⚠️ Nói quá | Đã tách 2 query + Promise.all, <2ms |
| 3 | Thiếu Streaming | ✅ Hoàn toàn đúng | Bottleneck thực sự |
| 4 | Thiếu Composite Index | ✅ Hoàn toàn đúng | Filter 167 rows thừa |
| 5 | Loading UI chưa tối ưu | ✅ Hoàn toàn đúng | Text sai ngữ cảnh |

### Những bottleneck `load.md` bỏ sót

| # | Vấn đề | Mức độ |
|---|--------|--------|
| 6 | Auth overhead (`getUser()` gọi nhiều lần) | 🔴 Nghiêm trọng |
| 7 | Dashboard Layout block (`getAllSettings`) | 🔴 Nghiêm trọng |
| 8 | Không có middleware.ts | 🟡 Trung bình |
| 9 | Client Component bundle nặng | 🟡 Trung bình |

### Ước tính cải thiện tổng thể

| Metric | Hiện tại (ước tính) | Sau tối ưu (ước tính) | Giải pháp chính |
|--------|---------------------|----------------------|-----------------|
| TTFB | ~300-500ms | ~100-200ms | Auth optimization + Settings cache |
| FCP | ~500-800ms | ~200-300ms | Suspense streaming + Skeleton UI |
| TTI | ~1000-1500ms | ~500-800ms | Dynamic import + Code splitting |

### Lưu ý quan trọng

**Bottleneck lớn nhất KHÔNG phải là database query** (đã rất nhanh, <2ms), mà là **auth overhead** (mỗi `getUser()` ~50-100ms network) và **layout blocking** (`getAllSettings`). Đây là những điểm `load.md` hoàn toàn bỏ sót.

### Về ước tính trong `load.md`

`load.md` dự kiến "TTFB giảm ~30-50% nhờ metadata nhẹ hơn" — con số này **không chính xác** vì:
1. Metadata đã được cache bởi React `cache()`, không tạo thêm DB call
2. Bottleneck chính là auth + layout, không phải metadata query

Các con số ước tính trong báo cáo này dựa trên phân tích code + EXPLAIN ANALYZE. Để có số liệu chính xác, cần đo thực tế bằng Chrome DevTools Performance tab hoặc Next.js `instrumentation.ts`.
