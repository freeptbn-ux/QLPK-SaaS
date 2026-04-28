# Phase 01: Ẩn cột Chẩn đoán (UI)
Status: ✅ Complete

## Objective
Loại bỏ cột "Chẩn đoán" khỏi bảng danh sách bệnh nhân ở cả giao diện Desktop và thẻ thông tin ở giao diện Mobile.

## Requirements
### Functional
- [x] Không hiển thị "Chẩn đoán" trên bảng Desktop (`<th>` và `<td>`).
- [x] Không hiển thị "Chẩn đoán" trên thẻ thông tin ở Mobile.
- [x] Điều chỉnh `colSpan` của dòng thông báo "Không tìm thấy bệnh nhân nào" cho phù hợp sau khi xóa bớt 1 cột.

### Non-Functional
- [ ] Giữ nguyên các chức năng khác (tìm kiếm, phân trang, thêm/sửa/xóa).

## Implementation Steps
1. [x] Sửa file `PatientListClient.tsx`
    - Xóa `<th>Chẩn đoán</th>` ở phần table thead (khoảng dòng 156).
    - Giảm giá trị `colSpan={8}` xuống `colSpan={7}` cho EmptyState của table (khoảng dòng 163).
    - Xóa thẻ `<td>` chứa dữ liệu `patient.diagnosis` ở thân bảng Desktop (khoảng dòng 192-194).
    - Xóa thẻ `<p>` chứa `Chẩn đoán:` ở phần Mobile Cards (khoảng dòng 247-249).

## Files to Create/Modify
- `src/components/features/patients/PatientListClient.tsx` - Điều chỉnh giao diện ẩn cột chẩn đoán.

## Test Criteria
- [ ] Truy cập `/patients` trên Desktop, kiểm tra bảng không còn cột "Chẩn đoán".
- [ ] Thu nhỏ cửa sổ thành Mobile, kiểm tra thông tin bệnh nhân không hiện "Chẩn đoán".
- [ ] Tìm kiếm không ra kết quả, đảm bảo dòng "Không tìm thấy..." hiển thị đầy đủ và không bị lệch cột.

---
Next Phase: N/A (Hoàn thành)
