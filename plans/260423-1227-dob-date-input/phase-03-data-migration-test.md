# Phase 03: Chuẩn hóa Dữ liệu Cũ & Kiểm thử End-to-End

Status: ⬜ Pending
Dependencies: Phase 01 + Phase 02

## Objective

Chuẩn hóa dữ liệu `dob` cũ trong database sang format DD/MM/YYYY (nếu có thể), và kiểm thử toàn bộ flow từ nhập liệu → lưu DB → hiển thị lại.

## Requirements

### Functional
- [ ] Tạo SQL migration script để chuẩn hóa dob cũ
- [ ] Xử lý các format cũ phổ biến (xem bảng phân loại bên dưới)
- [ ] Backup data trước khi chạy migration
- [ ] Build production thành công
- [ ] Test toàn bộ flow trên UI

### Non-Functional
- [ ] Không mất dữ liệu
- [ ] Migration có thể rollback

## Phân loại dữ liệu dob cũ

| Format cũ | Ví dụ | Chuyển đổi được? | Kết quả |
|-----------|-------|-------------------|---------|
| `YYYY-MM-DD` | `1990-06-15` | ✅ Có | `15/06/1990` |
| `DD/MM/YYYY` | `15/06/1990` | ✅ Đã đúng | Giữ nguyên |
| `YYYY` | `1990` | ⚠️ Một phần | `01/01/1990` (mặc định ngày 1/1) |
| `XX tháng` | `12 tháng` | ❌ Không | Giữ nguyên, đánh dấu cần nhập lại |
| `XX tuổi` | `3 tuổi` | ❌ Không | Giữ nguyên, đánh dấu cần nhập lại |
| Rỗng/NULL | | ✅ | Giữ NULL |

## Implementation Steps

### 1. Khảo sát data hiện tại

- [ ] Chạy query để xem phân bố format dob:

```sql
-- Đếm số lượng theo pattern
SELECT 
  CASE
    WHEN dob IS NULL OR dob = '' THEN 'NULL/EMPTY'
    WHEN dob ~ '^\d{4}-\d{2}-\d{2}$' THEN 'YYYY-MM-DD'
    WHEN dob ~ '^\d{2}/\d{2}/\d{4}$' THEN 'DD/MM/YYYY'
    WHEN dob ~ '^\d{4}$' THEN 'YYYY_ONLY'
    ELSE 'OTHER'
  END as format_type,
  COUNT(*) as cnt
FROM patients
GROUP BY format_type
ORDER BY cnt DESC;
```

### 2. Tạo migration script

- [ ] Tạo `scripts/migrate-dob-format.sql`

```sql
-- Backup trước
CREATE TABLE patients_dob_backup AS
SELECT id, dob FROM patients WHERE dob IS NOT NULL AND dob != '';

-- Chuyển YYYY-MM-DD → DD/MM/YYYY
UPDATE patients
SET dob = CONCAT(
  SUBSTRING(dob FROM 9 FOR 2), '/',
  SUBSTRING(dob FROM 6 FOR 2), '/',
  SUBSTRING(dob FROM 1 FOR 4)
)
WHERE dob ~ '^\d{4}-\d{2}-\d{2}$';

-- Chuyển YYYY → 01/01/YYYY
UPDATE patients
SET dob = CONCAT('01/01/', dob)
WHERE dob ~ '^\d{4}$';

-- Các format khác → giữ nguyên (user sẽ nhập lại khi edit)
```

### 3. Chạy migration

- [ ] Backup database
- [ ] Chạy dry-run (SELECT để xem kết quả trước khi UPDATE)
- [ ] Chạy migration thật
- [ ] Verify kết quả

### 4. Cập nhật hiển thị dob trong PatientList

- [ ] Review `PatientList.tsx` — đảm bảo cột "Ngày sinh" hiển thị format mới đẹp

### 5. Cập nhật hiển thị dob trong PatientDetail

- [ ] Review `PatientDetail.tsx` — đảm bảo hiển thị đúng

### 6. Build & Test End-to-End

- [ ] `npm run build` thành công
- [ ] Test flow: Thêm mới → Xem danh sách → Xem chi tiết → Sửa → Xem lại

## Files to Create/Modify

| File | Action | Mô tả |
|------|--------|--------|
| `scripts/migrate-dob-format.sql` | **CREATE** | SQL migration script |
| `src/components/features/patients/PatientList.tsx` | **REVIEW** | Kiểm tra hiển thị dob |
| `src/components/features/patients/PatientDetail.tsx` | **REVIEW** | Kiểm tra hiển thị dob |

## Test Criteria

- [ ] `npm run build` thành công, không lỗi TypeScript
- [ ] Thêm bệnh nhân mới với dob `15/06/1990` → Lưu thành công → Hiện đúng trong danh sách
- [ ] Thêm bệnh nhân mới không nhập dob → Lưu thành công
- [ ] Edit bệnh nhân cũ (dob format cũ) → Hiện ô trống, nhập lại → Lưu đúng
- [ ] Edit bệnh nhân cũ (dob đã chuẩn hóa) → Hiện đúng 3 ô → Sửa → Lưu đúng
- [ ] Tìm kiếm bệnh nhân → kết quả hiện dob đúng format
- [ ] Xem chi tiết bệnh nhân → dob hiện đúng format
- [ ] Check logic match trùng lặp: thêm bệnh nhân cùng tên + dob → hệ thống báo "đã tồn tại"

## Rollback Plan

```sql
-- Nếu cần rollback
UPDATE patients p
SET dob = b.dob
FROM patients_dob_backup b
WHERE p.id = b.id;

-- Sau khi chắc chắn OK, drop backup
DROP TABLE IF EXISTS patients_dob_backup;
```

## Notes

- Data dạng "12 tháng", "3 tuổi" sẽ KHÔNG thể chuyển tự động
- Những bệnh nhân có dob dạng này sẽ giữ nguyên giá trị cũ trong DB
- Khi user edit bệnh nhân đó → DateInput sẽ hiện trống → user nhập lại format mới
- Đây là thiết kế có chủ đích: không muốn đoán sai ngày sinh của bệnh nhân

---
✅ Hoàn thành plan! Quay lại `plan.md` để track progress.
