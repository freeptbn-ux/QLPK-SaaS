# 🏥 Báo cáo Tổng hợp: Tối ưu Tốc độ Trang `/patients/[id]`

> **Tổng hợp từ**: `load.md` (phân tích ban đầu) + `load2.md` (phản biện & bổ sung)  
> **Ngày**: 2026-05-07  
> **Tổng số vấn đề phát hiện**: 9 (3 nặng, 3 vừa, 3 nhẹ)

---

## 🔴 MỨC NẶNG — Ảnh hưởng lớn nhất đến tốc độ

Đây là các vấn đề gây chậm **hàng trăm ms** mỗi lần load trang. Cần ưu tiên xử lý trước.

---

### NẶNG-1: Auth overhead — `getUser()` gọi nhiều lần không cần thiết

| Thuộc tính | Chi tiết |
|-----------|---------|
| **Nguồn phát hiện** | `load2.md` (load.md bỏ sót) |
| **Ảnh hưởng** | ~100-200ms mỗi lần load trang |
| **File liên quan** | `src/actions/patients.ts`, `src/actions/settings.ts` |

**Mô tả**: Mỗi lần load `/patients/[id]`, hệ thống gọi `supabase.auth.getUser()` **ít nhất 2 lần** (1 từ `getAllSettings` trong layout, 1 từ `getPatientById` trong page). Mỗi lần `getUser()` gửi HTTP request tới Supabase Auth server (~50-100ms/call). React `cache()` KHÔNG cache qua các function khác nhau → mỗi function tạo Supabase client riêng, gọi auth riêng.

**Giải pháp đề xuất** (3 phương án, chọn 1):

| Phương án | Mô tả | Effort |
|-----------|-------|--------|
| A. Shared cached auth | Tạo `getAuthUser = cache(...)` dùng chung | Thấp |
| B. `getSession()` thay `getUser()` | Đọc từ cookie, không gọi mạng (cho read-only) | Thấp |
| C. Middleware.ts | Xử lý token refresh ở middleware, giảm auth trong actions | Trung bình |

---

### NẶNG-2: Dashboard Layout block — `getAllSettings()` chặn toàn bộ trang

| Thuộc tính | Chi tiết |
|-----------|---------|
| **Nguồn phát hiện** | `load2.md` (load.md bỏ sót) |
| **Ảnh hưởng** | ~50-150ms cố định cho MỌI trang dashboard |
| **File liên quan** | `src/app/(dashboard)/layout.tsx` |

**Mô tả**: `DashboardLayout` gọi `await getAllSettings()` rồi mới render `{children}`. Mọi page con (bao gồm `/patients/[id]`) phải **đợi settings xong** mới bắt đầu render — dù settings hiếm khi thay đổi.

**Giải pháp đề xuất**:

| Phương án | Mô tả | Effort |
|-----------|-------|--------|
| A. `unstable_cache` + revalidate | Cache settings với thời gian sống (ví dụ 5 phút) | Thấp |
| B. Client-side fetch | Dùng SWR/React Query với stale-while-revalidate | Trung bình |
| C. Preload pattern | Dùng `preload()` để không block layout render | Trung bình |

---

### NẶNG-3: Thiếu Streaming — Trang render monolithic

| Thuộc tính | Chi tiết |
|-----------|---------|
| **Nguồn phát hiện** | `load.md` ✅ (load2.md xác nhận đúng) |
| **Ảnh hưởng** | User phải đợi toàn bộ data (patient info + prescriptions) mới thấy nội dung |
| **File liên quan** | `src/app/(dashboard)/patients/[id]/page.tsx` |

**Mô tả**: Trang hiện tại là 1 Server Component duy nhất. Không có `<Suspense>`, không có streaming. User phải chờ tất cả hoàn tất (patient info + prescriptions) mới thấy giao diện.

**Giải pháp đề xuất**: Tách data fetching:
1. `page.tsx` chỉ fetch patient basic info (~0.2ms DB)
2. Tạo async server component `PrescriptionSection` fetch prescriptions
3. Wrap `PrescriptionSection` trong `<Suspense fallback={<PrescriptionSkeleton />}>`

**Kết quả**: Thông tin cá nhân hiển thị **gần như tức thì**, lịch sử đơn thuốc stream vào sau.

---

## 🟡 MỨC VỪA — Ảnh hưởng vừa phải, nên xử lý sau nhóm Nặng

---

### VỪA-1: Thiếu Composite Index trên `prescriptions_header`

| Thuộc tính | Chi tiết |
|-----------|---------|
| **Nguồn phát hiện** | `load.md` ✅ (load2.md xác nhận + bổ sung EXPLAIN ANALYZE) |
| **Ảnh hưởng hiện tại** | ~1ms (nhỏ với 681 records), **nhưng tăng tuyến tính khi data lớn** |
| **File liên quan** | Database — bảng `prescriptions_header` |

**Mô tả**: Hiện có 2 index lẻ: `(patient_id)` và `(prescription_date)`. Chưa có composite index. EXPLAIN ANALYZE cho thấy Postgres quét ngược index `prescription_date` rồi filter `patient_id`, loại bỏ **167 rows thừa**.

**Giải pháp**:
```sql
CREATE INDEX CONCURRENTLY idx_prescriptions_patient_date 
ON prescriptions_header (patient_id, prescription_date DESC);
```

**Lưu ý**: Với 681 records hiện tại thì impact chưa lớn (1ms). Nhưng khi data tăng lên 10K-100K, sẽ trở thành **bottleneck nghiêm trọng** nếu không có composite index.

---

### VỪA-2: Không có `middleware.ts` cho session management

| Thuộc tính | Chi tiết |
|-----------|---------|
| **Nguồn phát hiện** | `load2.md` (load.md bỏ sót) |
| **Ảnh hưởng** | Tăng latency auth + nguy cơ session hết hạn |
| **File liên quan** | Thiếu file `src/middleware.ts` |

**Mô tả**: Dự án không có `middleware.ts`. Hệ quả:
1. Token refresh xảy ra ở mỗi server action → tăng latency
2. Nguy cơ token hết hạn giữa chừng nếu user idle lâu
3. Không có early redirect cho unauthenticated requests

**Giải pháp**: Tạo `middleware.ts` theo pattern chuẩn Supabase SSR:
- Refresh session token
- Redirect unauthenticated users
- Giảm overhead auth cho server actions

---

### VỪA-3: Client Component bundle quá nặng

| Thuộc tính | Chi tiết |
|-----------|---------|
| **Nguồn phát hiện** | `load2.md` (load.md bỏ sót) |
| **Ảnh hưởng** | Tăng JS download + hydration time trên client |
| **File liên quan** | `PatientDetail.tsx`, `PrescriptionHistory.tsx` (885 lines!) |

**Mô tả**: `PatientDetail.tsx` (`'use client'`) import trực tiếp toàn bộ:
- `PrescriptionHistory` (885 lines, rất nhiều dialog, state)
- `PatientFormDialog`, `ConfirmDialog`
- `framer-motion`, `dayjs`, `react-icons`, `MedicineAutocomplete`

Toàn bộ JS bundle phải download + hydrate cùng lúc → TTI (Time to Interactive) tăng.

**Giải pháp**: Dynamic import cho các component nặng:
```tsx
const PrescriptionHistory = dynamic(() => import('./PrescriptionHistory'), {
  loading: () => <PrescriptionSkeleton />,
  ssr: false
});
```

---

## 🟢 MỨC NHẸ — Cải thiện nhỏ, làm khi có thời gian

---

### NHẸ-1: Loading UI sai ngữ cảnh

| Thuộc tính | Chi tiết |
|-----------|---------|
| **Nguồn phát hiện** | `load.md` ✅ (load2.md xác nhận đúng) |
| **Ảnh hưởng** | UX kém, text sai ngữ cảnh |
| **File liên quan** | Thiếu `src/app/(dashboard)/patients/[id]/loading.tsx` |

**Mô tả**: Khi vào `/patients/[id]`, user thấy text **"Đang tải danh sách bệnh nhân..."** (từ `patients/loading.tsx` của thư mục cha) — không phù hợp với trang chi tiết.

**Giải pháp**: Tạo `patients/[id]/loading.tsx` riêng với Skeleton UI mô phỏng layout trang chi tiết (4 cột thông tin + 1 khối lịch sử).

---

### NHẸ-2: Metadata load thừa data (lý thuyết)

| Thuộc tính | Chi tiết |
|-----------|---------|
| **Nguồn phát hiện** | `load.md` (load2.md đánh giá: đúng nhưng không ảnh hưởng) |
| **Ảnh hưởng** | Gần như không có — do React `cache()` |
| **File liên quan** | `src/app/(dashboard)/patients/[id]/page.tsx` |

**Mô tả**: `generateMetadata` gọi `getPatientById` (lấy cả prescriptions) dù chỉ cần `name`. Tuy nhiên React `cache()` đảm bảo chỉ 1 DB call trong cùng 1 request. Impact thực tế: chỉ thừa data trong memory, **không tốn thêm DB call**.

**Giải pháp** (nice-to-have): Tách `getPatientBasicInfo(id)` chỉ lấy `id, name` cho metadata. Ưu tiên thấp vì impact rất nhỏ.

---

### NHẸ-3: Lazy load chi tiết đơn thuốc khi expand

| Thuộc tính | Chi tiết |
|-----------|---------|
| **Nguồn phát hiện** | `load.md` (load2.md đánh giá: đúng nhưng impact thấp) |
| **Ảnh hưởng** | Nhỏ với data hiện tại (~4 details/prescription × 10 = ~40 rows) |
| **File liên quan** | `src/actions/patients.ts`, `PrescriptionHistory.tsx` |

**Mô tả**: Hiện tại fetch `prescription_details + medicines` cùng lúc với `prescriptions_header`. Có thể chỉ fetch header trước, khi user bấm expand mới fetch details.

**Giải pháp**: Chỉ fetch `prescriptions_header` ban đầu → fetch details qua Server Action khi expand. **Nhưng** với lượng data hiện tại (trung bình ~40 rows total), impact chưa đáng kể — nên làm khi data tăng lớn hơn.

---

## 📋 Tổng hợp & Thứ tự ưu tiên triển khai

| STT | Mức độ | Vấn đề | Effort | Impact | Ưu tiên |
|-----|--------|--------|--------|--------|---------|
| 1 | 🔴 Nặng | Auth overhead (`getUser()` gọi nhiều lần) | Thấp | Rất cao | ⭐⭐⭐ |
| 2 | 🔴 Nặng | Dashboard Layout block (`getAllSettings`) | Thấp-TB | Cao | ⭐⭐⭐ |
| 3 | 🟡 Vừa | Thiếu Composite Index | Rất thấp | TB→Cao | ⭐⭐⭐ |
| 4 | 🟢 Nhẹ | Loading UI sai ngữ cảnh | Rất thấp | TB | ⭐⭐⭐ |
| 5 | 🔴 Nặng | Thiếu Streaming (Suspense) | Trung bình | Rất cao | ⭐⭐ |
| 6 | 🟡 Vừa | Không có middleware.ts | Trung bình | Cao | ⭐⭐ |
| 7 | 🟡 Vừa | Client Component bundle nặng | Thấp | TB | ⭐ |
| 8 | 🟢 Nhẹ | Metadata load thừa data | Thấp | Rất nhỏ | ⭐ |
| 9 | 🟢 Nhẹ | Lazy load chi tiết đơn thuốc | Cao | Nhỏ | — |

### Gợi ý thứ tự triển khai (theo effort/impact ratio)

```
Phase 1 — Quick Wins (có thể xong trong 1 buổi):
  ├── [NẶNG-1] Tối ưu auth flow (shared cached auth hoặc getSession)
  ├── [VỪA-1]  Thêm composite index (1 câu SQL)
  └── [NHẸ-1]  Tạo loading.tsx cho [id] (1 file nhỏ)

Phase 2 — Core Optimization (1-2 buổi):
  ├── [NẶNG-2] Tối ưu dashboard layout (cache settings)
  ├── [NẶNG-3] Triển khai Suspense streaming
  └── [VỪA-2]  Tạo middleware.ts

Phase 3 — Polish (khi có thời gian):
  ├── [VỪA-3]  Dynamic import PrescriptionHistory
  ├── [NHẸ-2]  Tách getPatientBasicInfo cho metadata
  └── [NHẸ-3]  Lazy load prescription details
```

### Ước tính cải thiện tổng thể

| Metric | Hiện tại | Sau Phase 1 | Sau Phase 2 | Sau Phase 3 |
|--------|----------|-------------|-------------|-------------|
| TTFB | ~300-500ms | ~200-300ms | ~100-200ms | ~100-150ms |
| FCP | ~500-800ms | ~400-600ms | ~200-300ms | ~150-250ms |
| TTI | ~1-1.5s | ~800ms-1.2s | ~500-800ms | ~400-600ms |
