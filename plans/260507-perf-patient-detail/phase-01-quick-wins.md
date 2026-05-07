# Phase 01: Quick Wins — DB Index + Loading UI

Status: ⬜ Pending  
Dependencies: Không có  
Effort: ~15 phút  
Fixes: 🟡 Thiếu Composite Index + 🟢 Loading UI sai ngữ cảnh

---

## Objective

Xử lý 2 vấn đề không phụ thuộc code phức tạp, có thể làm ngay lập tức:
1. Thêm composite index để Postgres không phải filter thừa rows
2. Tạo Skeleton loading UI riêng cho trang chi tiết bệnh nhân

---

## Task 1: Thêm Composite Index cho `prescriptions_header`

### Vấn đề hiện tại

Indexes hiện có (riêng lẻ):
```
idx_prescriptions_header_patient_id  → btree (patient_id)
idx_prescriptions_header_date        → btree (prescription_date)
```

EXPLAIN ANALYZE cho thấy Postgres dùng index `prescription_date` rồi filter `patient_id`, loại bỏ **167 rows thừa**:
```
Index Scan Backward using idx_prescriptions_header_date
  Filter: (patient_id = 18)
  Rows Removed by Filter: 167
```

### Giải pháp

Thêm composite index:
```sql
CREATE INDEX CONCURRENTLY idx_prescriptions_patient_date 
ON prescriptions_header (patient_id, prescription_date DESC);
```

### Implementation Steps

- [ ] **1.1** Chạy migration tạo composite index trên Supabase
- [ ] **1.2** Chạy `EXPLAIN ANALYZE` lại query cũ để verify index được sử dụng
- [ ] **1.3** Xác nhận `Rows Removed by Filter` = 0

### Expected Result

```
Index Scan using idx_prescriptions_patient_date
  Index Cond: (patient_id = 18)
  Rows Removed by Filter: 0     ← Zero rows thừa!
```

---

## Task 2: Tạo Skeleton Loading UI cho `/patients/[id]`

### Vấn đề hiện tại

File `src/app/(dashboard)/patients/loading.tsx` hiện có:
```tsx
export default function PatientsLoading() {
  return <LoadingReporter text="Đang tải danh sách bệnh nhân..." />;
}
```

Text **"Đang tải danh sách bệnh nhân..."** hiển thị cả khi vào trang chi tiết → sai ngữ cảnh.

### Giải pháp

Tạo file `src/app/(dashboard)/patients/[id]/loading.tsx` riêng với Skeleton UI.

### Implementation Steps

- [ ] **2.1** Tạo file `src/app/(dashboard)/patients/[id]/loading.tsx`
- [ ] **2.2** Skeleton UI phải mô phỏng đúng layout trang chi tiết:
  - Header (tên bệnh nhân + mã bệnh nhân) → skeleton text
  - 4 cột thông tin cá nhân (Họ tên, Giới tính, Ngày sinh, SĐT) → skeleton blocks
  - 2 cột phụ (Địa chỉ, Cân nặng) → skeleton blocks
  - Khối lịch sử đơn thuốc → skeleton list (3-4 items)
- [ ] **2.3** Dùng animation pulse (TailwindCSS `animate-pulse`) cho skeleton
- [ ] **2.4** Test: Navigate đến `/patients/[id]` → phải thấy skeleton thay vì text sai

### Files to Create

| File | Mục đích |
|------|----------|
| `src/app/(dashboard)/patients/[id]/loading.tsx` | Skeleton loading UI cho trang chi tiết |

### Test Criteria

- [ ] Vào `/patients/[id]` hiển thị skeleton UI (không phải text "Đang tải danh sách...")
- [ ] Skeleton layout khớp với layout thực tế (không bị layout shift)
- [ ] Animation smooth, không giật

---

## Notes

- Phase này **hoàn toàn độc lập**, có thể làm mà không ảnh hưởng gì đến code hiện tại
- Composite index dùng `CONCURRENTLY` nên không lock table
- Skeleton UI là file mới, không sửa file cũ

---

Next Phase: → [Phase 02: Middleware + Auth Optimization](./phase-02-middleware-auth.md)
