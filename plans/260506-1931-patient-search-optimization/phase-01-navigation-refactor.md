# Phase 01: Refactor Navigation (Sạch lịch sử & Không giật trang)
Status: ✅ Completed
Dependencies: None

## 🎯 Mục tiêu
Thay đổi cách thức cập nhật URL khi người dùng tìm kiếm hoặc chuyển trang để tránh làm rác lịch sử trình duyệt (Browser History) và ngăn việc tự động cuộn lên đầu trang (Scroll to top).

## ✅ Yêu cầu
- [x] Chuyển `router.push` sang `router.replace` trong hàm tìm kiếm.
- [x] Thêm option `{ scroll: false }` cho tất cả các hành động chuyển trang trong danh sách bệnh nhân.
- [x] Đảm bảo việc xóa từ khóa tìm kiếm cũng không tạo history mới.

## 🛠️ Các bước thực hiện
1. [x] Mở file `src/components/features/patients/PatientListClient.tsx`.
2. [x] Tìm hàm `handleSearch`:
    - Thay `router.push` bằng `router.replace`.
    - Thêm tham số `{ scroll: false }`.
3. [x] Tìm hàm `handleChangePage`:
    - Thêm tham số `{ scroll: false }` vào `router.push` (hoặc chuyển sang `replace` nếu muốn giữ history sạch cả khi chuyển trang).
4. [x] Tìm hàm `handleChangeRowsPerPage`:
    - Thêm tham số `{ scroll: false }` vào `router.push`.

## 📂 File cần chỉnh sửa
- `src/components/features/patients/PatientListClient.tsx`

## 🧪 Tiêu chí kiểm thử
- [x] Gõ từ khóa tìm kiếm, sau đó nhấn nút Back của trình duyệt: Phải quay về trang trước đó ngay lập tức (không phải lùi từng ký tự).
- [x] Khi tìm kiếm hoặc đổi trang, vị trí cuộn chuột của trình duyệt không bị nhảy lên đầu trang.

---
Next Phase: [Phase 02: Transition & Loading Feedback](./phase-02-transition-feedback.md)
