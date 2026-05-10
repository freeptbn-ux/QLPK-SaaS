# Phase 01: Server-side Optimization
Status: ✅ Completed
Dependencies: None

## Objective
Tối ưu hóa cách thức lấy dữ liệu từ Database và xử lý tại Server để giảm tải cho cả DB và Network.

## Requirements
### Functional
- [x] Implement Server-side Pagination in `src/actions/medicines.ts`.
- [x] Implement Server-side Search Filtering in `src/actions/medicines.ts`.
- [x] Deduplicate DB calls using React `cache()`.

### Non-Functional
- [x] Giảm số lượng bản ghi trả về mỗi request (mặc định 10-20 bản ghi).
- [x] Tận dụng index của Postgres để tìm kiếm nhanh hơn.

## Implementation Steps
1. [x] **Modify `src/actions/medicines.ts`**:
    - Thêm tham số `page`, `limit`, `search` vào hàm lấy danh sách thuốc.
    - Sử dụng `.range()` của Supabase để lấy đúng khoảng dữ liệu.
    - Sử dụng `.ilike()` hoặc `.or()` để lọc theo tên thuốc ngay tại DB.
2. [x] **Wrap Actions with `cache()`**:
    - Sử dụng `import { cache } from 'react'` để wrap `getAllSettings` và các hàm fetch dữ liệu khác.
3. [x] **Update `src/app/(dashboard)/medicines/page.tsx`**:
    - Nhận `searchParams` từ props của Page.
    - Truyền `searchParams.page` và `searchParams.search` vào server action.

## Files to Create/Modify
- `src/actions/medicines.ts` - Cập nhật logic fetch dữ liệu.
- `src/actions/settings.ts` - Thêm React cache.
- `src/app/(dashboard)/medicines/page.tsx` - Cập nhật cách gọi data.

## Test Criteria
- [x] Kiểm tra Network Tab: Payload của RSC phải nhỏ đi đáng kể (chỉ chứa data trang hiện tại).
- [x] Kiểm tra Logs: Không có duplicate queries cho Settings trong một lần render.

---
Next Phase: [Phase 02: Client Optimization](phase-02-client-optimization.md)
