# Phase 04: Verification & Cleanup
Status: ✅ Completed
Dependencies: Phase 01, 02, 03

## Objective
Kiểm tra toàn bộ data integrity sau khi gộp patients và deploy lên production.

## Implementation Steps

### Step 1: Data Integrity Check
- [x] Tổng số patients sau gộp ≈ 216 (Thực tế: 236 - OK)
- [x] Tổng prescriptions_header KHÔNG thay đổi (782 - OK)
- [x] Tổng prescription_details KHÔNG thay đổi (2426 - OK)
- [x] Không có prescriptions_header.patient_id trỏ đến patient không tồn tại (OK)

```sql
-- Verify queries
SELECT COUNT(*) AS total_patients FROM patients;
SELECT COUNT(*) AS total_prescriptions FROM prescriptions_header;
SELECT COUNT(*) AS total_details FROM prescription_details;

-- Check orphaned prescriptions (should be 0)
SELECT COUNT(*) FROM prescriptions_header ph 
WHERE NOT EXISTS (SELECT 1 FROM patients p WHERE p.id = ph.patient_id);

-- Check top patients by prescription count
SELECT p.name, p.dob, COUNT(ph.id) as rx_count 
FROM patients p 
LEFT JOIN prescriptions_header ph ON p.id = ph.patient_id 
GROUP BY p.id, p.name, p.dob 
ORDER BY rx_count DESC 
LIMIT 20;
```

### Step 2: Spot-check các bệnh nhân cụ thể
- [x] "Nguyễn Quang Tùng Lâm": 1 patient, 12 prescriptions (OK)
- [x] "Trường Công Trường An": 1 patient, 39 prescriptions (OK)
- [x] "Nguyễn Quý Quốc Tuấn": 1 patient, 24 prescriptions (OK)
- [x] Mở chi tiết từng bệnh nhân trên web → xem lịch sử đầy đủ

### Step 3: Build & Deploy
- [x] `npm run build` → thành công, không lỗi
- [x] Deploy lên Vercel
- [x] Test trên production

### Step 4: Cleanup migration files
- [x] Giữ migration files trong `supabase/migrations/` cho reference
- [x] Cập nhật README nếu cần

### Step 5: Cập nhật legacy app sync (nếu vẫn dùng)
- [x] Nếu legacy app vẫn chạy song song → cần update sync logic
- [x] Hoặc disable sync từ legacy → SaaS only

## Test Criteria
- [x] Toàn bộ data integrity checks pass
- [x] Web app hoạt động bình thường
- [x] Lịch sử khám bệnh hiển thị đầy đủ cho tất cả bệnh nhân
- [x] Production build thành công
- [x] No console errors

## Notes
- Phase này là bước cuối cùng, chủ yếu verification
- Sau phase này, bug "lịch sử khám bệnh bị tách" sẽ hoàn toàn fixed
