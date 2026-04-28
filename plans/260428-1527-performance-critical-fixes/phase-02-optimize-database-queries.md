# Phase 02: Tối ưu Database Queries
Status: ✅ Completed
Dependencies: Không (có thể làm song song Phase 01)

## Vấn đề hiện tại

File `src/actions/patients.ts` có 2 vấn đề:

### Vấn đề A: `searchPatients` dùng `count: 'exact'`
- **Dòng 47**: `.select('*', { count: 'exact' })`
- Trong khi `getPatientsPaginated` (dòng 23) đã đúng dùng `count: 'estimated'`
- `count: 'exact'` bắt Postgres quét toàn bộ bảng để đếm chính xác → O(n)
- Với 10,000+ bệnh nhân: search mất 500ms-2000ms thay vì 50-100ms

### Vấn đề B: `getMedicineUsageByPatient` xử lý aggregation bằng JS
- **Dòng 240-282**: Lấy toàn bộ dữ liệu thô rồi dùng JS `Map` để nhóm
- Nên để database làm việc aggregation thay vì kéo data lên server rồi xử lý

## Implementation Steps

### 1. Đổi `count: 'exact'` thành `count: 'estimated'` trong `searchPatients`
- [x] Sửa dòng 47: `{ count: 'exact' }` → `{ count: 'estimated' }`

```typescript
// TRƯỚC (dòng 47):
.select('*', { count: 'exact' });

// SAU:
.select('*', { count: 'estimated' });
```

**Giải thích**: `count: 'estimated'` dùng `pg_class.reltuples` (bộ đếm nội bộ của Postgres), trả về gần đúng nhưng cực nhanh (O(1)). Sai số thường <5%, chấp nhận được cho pagination.

### 2. (Tùy chọn) Tối ưu `getMedicineUsageByPatient` — Chuyển aggregation vào SQL
- [ ] Thay thế logic JS bằng Supabase query có group by

```typescript
// TRƯỚC: Lấy raw data → JS map/reduce
const { data } = await supabase
  .from('prescription_details')
  .select(`medicine_id, medicines(name, packing_spec), prescriptions_header!inner(patient_id)`)
  .eq('prescriptions_header.patient_id', patientId);
// ... rồi dùng Map() để nhóm

// SAU: Dùng RPC hoặc view (nếu đã có RPC sẵn)
// Nếu chưa có RPC, giữ nguyên code hiện tại cũng chấp nhận được
// vì lượng data per-patient thường không quá lớn (<100 rows)
```

**Lưu ý**: Bước 2 là **tùy chọn**. Nếu số lượng đơn thuốc mỗi bệnh nhân thường <100, code JS hiện tại vẫn đủ nhanh. Chỉ cần fix bước 1 là đủ critical.

### 3. Kiểm tra
- [x] Chạy `npm run dev`
- [x] Test search bệnh nhân — kết quả vẫn đúng, pagination hoạt động
- [x] Không có lỗi TypeScript

## Files thay đổi
- `src/actions/patients.ts` — **SỬA** dòng 47 (đổi count)

## Kết quả mong đợi
- Search bệnh nhân nhanh hơn **80-90%** (50-100ms thay vì 500-2000ms)
- Database CPU giảm đáng kể khi nhiều người search cùng lúc

---
Next Phase: [phase-03-batch-state-and-chart-animation.md](./phase-03-batch-state-and-chart-animation.md)
