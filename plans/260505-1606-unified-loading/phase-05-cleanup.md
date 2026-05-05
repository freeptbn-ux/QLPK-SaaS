# Phase 05: Cleanup & Polish

## Objective
Dọn dẹp code dư thừa và đảm bảo trải nghiệm người dùng đạt mức "Premium".

## Implementation Steps
1. [ ] Rà soát lại tất cả các component `Loading`, `BallLoader` để đảm bảo chúng không còn bị gọi dư thừa ở các trang lẻ.
2. [ ] Tinh chỉnh CSS của `BallLoader.module.css` để overlay nhìn chuyên nghiệp hơn (backdrop-filter, blur, độ trong suốt).
3. [ ] Kiểm tra khả năng tương thích Dark Mode cho toàn bộ hệ thống loading mới.
4. [ ] Xóa bỏ các component loading cũ không còn sử dụng (nếu có).

## Files to Create/Modify
- `src/components/Loading/BallLoader.module.css`
- `src/components/Loading/index.ts`

## Test Criteria
- [ ] Không còn bất kỳ file nào gọi loader inline gây hiện tượng "nhảy" layout.
- [ ] Giao diện load mượt mà, "như một ứng dụng native".
