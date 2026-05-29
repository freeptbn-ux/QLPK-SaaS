# Phase 02: Client-side Optimization
Status: ✅ Completed
Dependencies: Phase 01

## Objective
Nâng cao trải nghiệm người dùng (UX) bằng cách tối ưu hóa các thành phần giao diện, sử dụng URL làm nguồn dữ liệu chính cho Search/Pagination.

## Requirements
### Functional
- [x] Chuyển Search/Pagination logic sang sử dụng URL Search Params.
- [x] Thêm Pagination Controls (Phân trang).
- [x] Implement Debounce cho ô tìm kiếm.
- [x] Thêm Optimistic UI cho các thao tác Mutation.

### Non-Functional
- [ ] Giao diện tìm kiếm phải mượt mà, không gây lag.
- [ ] Người dùng có thể copy URL và quay lại đúng trang/kết quả tìm kiếm đó.

## Implementation Steps
1. [x] **Update `MedicineList.tsx`**:
    - Xóa logic lọc phía client (`useMemo`).
    - Sử dụng `useRouter` và `usePathname` từ `next/navigation` để cập nhật URL khi người dùng thay đổi trang hoặc gõ tìm kiếm.
2. [x] **Create `Pagination` Component**:
    - Thiết kế bộ điều khiển trang (Trang trước, Trang sau, Số trang hiện tại).
3. [x] **Implement Debounce**:
    - Sử dụng `use-debounce` hoặc logic tự viết để trì hoãn việc cập nhật URL khi gõ phím.
4. [x] **Add Optimistic UI**:
    - Sử dụng `useOptimistic` hook (nếu dùng React 18/Next 14) hoặc cập nhật state cục bộ ngay lập tức khi Thêm/Xóa thuốc.

## Files to Create/Modify
- `src/components/medicines/MedicineList.tsx` - Refactor logic chính.
- `src/components/ui/Pagination.tsx` - Component mới cho phân trang.
- `src/components/medicines/MedicineSearch.tsx` - Thêm logic debounce và URL sync.

## Test Criteria
- [x] Gõ tìm kiếm: URL thay đổi sau 300ms, danh sách thuốc cập nhật tự động.
- [x] Nhấn Next Page: Dữ liệu trang mới được tải mà không reload toàn bộ ứng dụng.

---
Next Phase: [Phase 03: Technical Polish](phase-03-technical-polish.md)
