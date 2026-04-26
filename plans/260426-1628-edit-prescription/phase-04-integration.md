# Phase 04: Integration & Testing
Status: ✅ Completed
Dependencies: Phase 01, 02, 03

## Objective
Kết nối toàn bộ flow end-to-end, kiểm tra các edge case quan trọng, và đảm bảo hệ thống hoạt động chính xác.

## Requirements
### Functional
- [x] Flow hoàn chỉnh: Click sửa → Fill form → Submit → DB cập nhật → UI cập nhật → Kho đồng bộ.
- [x] Kiểm tra tất cả edge case kho thuốc.
- [x] Kiểm tra tương tác với các chức năng hiện có (kê đơn, xóa đơn, thêm thuốc).

### Non-Functional
- [x] Không regression trên các chức năng đã có.
- [x] Performance: Dialog mở nhanh, không lag khi edit.

## Implementation Steps

### Step 1: Chạy migration trên Supabase
- Mở Supabase Dashboard → SQL Editor
- Chạy nội dung file `20260426163000_add_update_prescription_rpc.sql`
- Verify: `SELECT proname FROM pg_proc WHERE proname = 'update_prescription';`

### Step 2: Test thủ công — Happy path
1. Mở app → Vào trang bệnh nhân có đơn thuốc
2. Expand đơn thuốc bất kỳ → Click "Sửa đơn"
3. Sửa chẩn đoán → Lưu → Verify trên UI
4. Sửa số lượng thuốc → Lưu → Verify trên UI + kiểm tra kho
5. Xóa 1 thuốc khỏi đơn → Lưu → Verify kho được bù
6. Thêm thuốc mới → Lưu → Verify kho bị trừ
7. Đổi thuốc A→B → Lưu → Verify kho A bù, kho B trừ

### Step 3: Test edge cases

| # | Test case | Expected |
|---|-----------|----------|
| 1 | Sửa đơn, giữ nguyên mọi thứ, bấm Lưu | Kho không đổi, data không đổi |
| 2 | Tăng SL thuốc khi kho chỉ còn 2 | Cảnh báo kho âm, vẫn cho lưu |
| 3 | Xóa hết thuốc rồi bấm Lưu | Validation error: "Cần ít nhất 1 loại thuốc" |
| 4 | Bỏ trống chẩn đoán rồi bấm Lưu | Validation error |
| 5 | Sửa đơn mới nhất | `patients.diagnosis` được cập nhật |
| 6 | Sửa đơn cũ (không phải mới nhất) | `patients.diagnosis` KHÔNG đổi |
| 7 | Sửa ngày kê đơn | Ngày trên UI cập nhật đúng |
| 8 | Đang lưu bấm nút Lưu liên tục | Không gửi request trùng (disabled khi loading) |
| 9 | Sửa rồi xóa đơn đó | Xóa bình thường, kho bù đúng |
| 10 | Kê đơn mới → Sửa đơn vừa kê | Hoạt động bình thường |

### Step 4: Verify tổng tiền
- Trước khi sửa: ghi lại `total_amount`
- Sau khi sửa: kiểm tra `total_amount = SUM(qty * price) + consultation_fee` (cũ)
- Kiểm tra dashboard doanh thu có phản ánh đúng thay đổi

### Step 5: Kiểm tra không regression
- [x] Kê đơn mới vẫn hoạt động bình thường
- [x] Xóa đơn thuốc vẫn hoạt động bình thường
- [x] Thêm thuốc vào đơn hôm nay vẫn hoạt động bình thường
- [x] Dashboard doanh thu hiển thị đúng
- [x] Trang danh sách bệnh nhân không bị lỗi

## Files to Create/Modify
- Không có file mới — chỉ verify và fix bugs nếu cần

## Test Criteria
- [x] Tất cả 10 test cases ở Step 3 pass
- [x] Không regression trên chức năng kê đơn, xóa đơn, thêm thuốc
- [x] Kho thuốc luôn đúng sau mọi thao tác

## Notes
- Nếu phát hiện bug, fix trực tiếp trong phase này.
- Sau phase này, cập nhật `plan.md` status → ✅ Complete.

---
Previous Phase: [Phase 03: Frontend](./phase-03-frontend.md)
