# Phase 01: Implement Clickable Headers & Logic
Status: ✅ DONE

## Objective
Thay đổi giao diện bảng và thêm logic sắp xếp trực tiếp trên Frontend cho component `MedicineUsageDialog.tsx`.

## Requirements
### Functional
- [x] Bấm vào tiêu đề "Tên thuốc": Sắp xếp A-Z -> Z-A -> Hủy sắp xếp.
- [x] Bấm vào tiêu đề "Số lần": Sắp xếp Lớn-Nhỏ -> Nhỏ-Lớn -> Hủy sắp xếp.
- [x] Hiển thị Icon mũi tên (`HiChevronUpDown`, `HiChevronUp`, `HiChevronDown`) bên cạnh tiêu đề cột để thể hiện trạng thái sắp xếp tương ứng.

### Non-Functional
- [x] Performance: Sử dụng `useMemo` để không tính toán lại việc sort nếu `data` không đổi hoặc `sortConfig` không đổi.
- [x] UI/UX: Hiển thị cursor `pointer` và hiệu ứng hover khi di chuột vào tiêu đề cột để người dùng nhận biết có thể click được.

## Implementation Steps
1. [x] Cập nhật Interface thêm cấu trúc `SortConfig`: `type SortConfig = { key: 'name' | 'count', direction: 'asc' | 'desc' } | null;`
2. [x] Thêm State `sortConfig` vào component `MedicineUsageDialog`.
3. [x] Viết hàm `handleSort(key)` để thay đổi giá trị của `sortConfig` khi user click.
4. [x] Viết logic tạo `sortedData` từ `data` và `sortConfig` bằng `useMemo`. So sánh chuỗi tiếng Việt với `localeCompare` và so sánh số cho cột số lần.
5. [x] Cập nhật cấu trúc `<thead>`, chuyển các `<th>` thành các element có thể click được (thêm `cursor-pointer`, sự kiện `onClick`).
6. [x] Cập nhật phần render `<tbody>` để map qua `sortedData` thay vì `data` gốc.

## Files to Create/Modify
- `src/components/features/patients/MedicineUsageDialog.tsx` - Nơi chứa bảng dữ liệu lịch sử dùng thuốc.

## Test Criteria
- [x] Bảng sắp xếp đúng "Tên thuốc" theo bảng chữ cái.
- [x] Bảng sắp xếp đúng "Số lần" theo giá trị số.
- [x] Các mũi tên chỉ hướng hiển thị và thay đổi đúng với mỗi lần click.

---
Next Phase: Phase 02 - Testing & UI Polish
