# Phase 01: Fix Supabase Query - Sửa truy vấn sai cột
**Status:** ✅ Done
**Dependencies:** Không
**Ưu tiên:** 🔴 CRITICAL - Đây là nguyên nhân chính gây lỗi 404

## Objective
Sửa hàm `getPatientById` đang truy vấn cột `unit` không tồn tại trong bảng `medicines`, thay bằng `packing_spec` (cột đúng).

## Root Cause Analysis

### Vấn đề
```typescript
// src/actions/patients.ts:61
.select('*, prescriptions:prescriptions_header(*, prescription_details(*, medicines(name, unit)))')
//                                                                              ^^^^
//                                                                    Cột này KHÔNG TỒN TẠI!
```

### Bảng medicines thực tế (từ 001_initial_schema.sql)
```sql
CREATE TABLE IF NOT EXISTS medicines (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  packing_spec TEXT,       -- ← Đây mới là cột đúng
  price REAL DEFAULT 0.0,
  stock_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 5
);
```

### Tại sao gây 404?
1. Supabase PostgREST nhận truy vấn select `unit` → không tìm thấy cột → trả về error
2. `getPatientById` nhận error → return `null`
3. Trang `[id]/page.tsx` kiểm tra `if (!patient)` → gọi `notFound()`
4. Next.js render trang 404

## Requirements
### Functional
- [ ] Sửa `medicines(name, unit)` → `medicines(name, packing_spec)` trong `getPatientById`
- [ ] Kiểm tra xem `getPrescriptionsByPatient` trong `prescriptions.ts` đã đúng chưa (đã đúng: `medicines(name, packing_spec)`)
- [ ] Kiểm tra `PrescriptionHistory.tsx` component expect đúng field `packing_spec`

### Non-Functional
- [ ] Không ảnh hưởng tới các trang/action khác

## Implementation Steps
1. [ ] Mở file `src/actions/patients.ts`
2. [ ] Dòng 61: Thay `medicines(name, unit)` → `medicines(name, packing_spec)`
3. [ ] Verify: build thành công `npm run build`
4. [ ] Test: Truy cập `/patients/767` phải hiện thông tin bệnh nhân

## Files to Modify
- `src/actions/patients.ts` - Dòng 61: sửa select query

## Test Criteria
- [ ] `npm run build` thành công
- [ ] Trang `/patients/767` hiển thị thông tin bệnh nhân (không còn 404)
- [ ] Trang `/patients` danh sách vẫn hoạt động bình thường
- [ ] Lịch sử khám bệnh hiện đúng tên thuốc và quy cách đóng gói

---
Next Phase: → phase-02-fix-prescribe-params.md
