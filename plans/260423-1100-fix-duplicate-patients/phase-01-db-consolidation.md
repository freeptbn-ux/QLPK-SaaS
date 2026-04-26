# Phase 01: Database Consolidation - Gộp bệnh nhân trùng lặp
Status: ✅ Completed
Dependencies: None

## Objective
Gộp tất cả bản ghi patients trùng lặp (cùng name_normalized + dob) thành 1 bản ghi duy nhất.
Re-link toàn bộ prescriptions_header.patient_id từ các bản sao về bản ghi chính.

## Phân tích dữ liệu hiện tại
- 716 total patients → 216 unique (by name_normalized + dob)
- 124 nhóm bị trùng, tổng 624 bản ghi cần gộp
- Top trùng: "Trường Công Trường An" (31 lần), "Nguyễn Quý Quốc Tuấn" (23 lần)

## Chiến lược gộp
Cho mỗi nhóm (name_normalized, dob):
1. **Giữ lại bản ghi có ID NHỎ NHẤT** (bản ghi gốc, tạo đầu tiên)
2. **Cập nhật thông tin** từ bản ghi MỚI NHẤT (phone, address, weight, diagnosis mới nhất)
3. **Re-link prescriptions**: Chuyển tất cả `prescriptions_header.patient_id` từ bản sao → bản chính
4. **Xóa bản sao** sau khi đã re-link xong

## Implementation Steps

### Step 1: Tạo SQL migration file
- [ ] File: `supabase/migrations/004_consolidate_patients.sql`

```sql
-- Phase 1: Consolidate duplicate patients
-- Strategy: Keep lowest ID per (name_normalized, dob) group
-- Re-link all prescriptions to the primary patient

-- Step 1: Create temp table mapping duplicate IDs → primary IDs
CREATE TEMP TABLE patient_merge_map AS
WITH ranked AS (
  SELECT 
    id,
    name_normalized,
    dob,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(name_normalized), COALESCE(dob, '')
      ORDER BY id ASC
    ) AS rn,
    FIRST_VALUE(id) OVER (
      PARTITION BY LOWER(name_normalized), COALESCE(dob, '')
      ORDER BY id ASC
    ) AS primary_id
  FROM patients
)
SELECT id AS old_id, primary_id AS new_id
FROM ranked
WHERE rn > 1;

-- Step 2: Re-link prescriptions from duplicates to primary patient
UPDATE prescriptions_header ph
SET patient_id = mm.new_id
FROM patient_merge_map mm
WHERE ph.patient_id = mm.old_id;

-- Step 3: Update primary patient with latest info from duplicates
-- (lấy diagnosis, phone, address, weight từ bản ghi mới nhất)
WITH latest_info AS (
  SELECT DISTINCT ON (LOWER(p.name_normalized), COALESCE(p.dob, ''))
    FIRST_VALUE(p.id) OVER w AS primary_id,
    p.diagnosis AS latest_diagnosis,
    p.phone AS latest_phone,
    p.address AS latest_address,
    p.weight AS latest_weight
  FROM patients p
  WINDOW w AS (
    PARTITION BY LOWER(p.name_normalized), COALESCE(p.dob, '')
    ORDER BY p.id ASC
  )
  ORDER BY LOWER(p.name_normalized), COALESCE(p.dob, ''), p.id DESC
)
-- Simplified: use a separate update
UPDATE patients p
SET 
  diagnosis = sub.latest_diagnosis,
  phone = COALESCE(sub.latest_phone, p.phone),
  address = COALESCE(sub.latest_address, p.address),
  weight = COALESCE(sub.latest_weight, p.weight)
FROM (
  SELECT 
    MIN(id) AS primary_id,
    (ARRAY_AGG(diagnosis ORDER BY id DESC))[1] AS latest_diagnosis,
    (ARRAY_AGG(phone ORDER BY id DESC NULLS LAST))[1] AS latest_phone,
    (ARRAY_AGG(address ORDER BY id DESC NULLS LAST))[1] AS latest_address,
    (ARRAY_AGG(weight ORDER BY id DESC NULLS LAST))[1] AS latest_weight
  FROM patients
  GROUP BY LOWER(name_normalized), COALESCE(dob, '')
  HAVING COUNT(*) > 1
) sub
WHERE p.id = sub.primary_id;

-- Step 4: Delete duplicate patient records (prescriptions already re-linked)
DELETE FROM patients 
WHERE id IN (SELECT old_id FROM patient_merge_map);

-- Step 5: Reset sequence
SELECT setval('patients_id_seq', (SELECT MAX(id) FROM patients));

-- Cleanup
DROP TABLE IF EXISTS patient_merge_map;
```

### Step 2: Tạo Python script kiểm tra trước khi chạy
- [ ] File: `scripts/check_duplicates.py`
- Liệt kê tất cả nhóm trùng + số prescriptions sẽ bị re-link
- Dry-run: in ra mapping (old_id → new_id) mà KHÔNG thay đổi data

### Step 3: Backup trước khi chạy
- [ ] Backup database Supabase trước khi chạy migration
- [ ] Export danh sách patients hiện tại ra CSV

### Step 4: Chạy migration trên Supabase
- [ ] Chạy SQL migration qua Supabase SQL Editor
- [ ] Kiểm tra kết quả: số patients sau gộp = 216 (hoặc gần đó)

## Test Criteria
- [ ] Số patients sau gộp ≈ 216 (unique by name+dob)
- [ ] Không mất prescriptions nào (tổng prescriptions_header trước = sau)
- [ ] Không mất prescription_details nào
- [ ] Mỗi patient chỉ xuất hiện 1 lần trong danh sách
- [ ] "Nguyễn Quang Tùng Lâm" chỉ còn 1 record, có ~11 prescriptions

## ⚠️ Rủi ro
- Một số patients cùng tên nhưng KHÁC NGƯỜI (cùng tên, khác dob) → xử lý bằng `dob` check
- Patients cùng tên, KHÔNG CÓ dob → cần review thủ công (hoặc thêm phone check)
- Foreign key constraint khi xóa duplicate → phải re-link prescriptions TRƯỚC

## Notes
- Migration này chỉ chạy 1 lần, không cần rollback trong code
- Nên chạy vào thời điểm ít user truy cập
- Sau khi gộp xong, SaaS app sẽ tự động hiển thị đúng vì query theo patient_id

---
Next Phase: [phase-02-query-logic.md](./phase-02-query-logic.md)
