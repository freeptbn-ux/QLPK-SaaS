# Phase 02: Transition & Loading Feedback
Status: ✅ Completed
Dependencies: Phase 01

## 🎯 Mục tiêu
Cải thiện cảm giác phản hồi của ứng dụng bằng cách sử dụng `useTransition` để xử lý việc cập nhật dữ liệu ngầm và hiển thị trạng thái loading ngay tại ô tìm kiếm.

## ✅ Yêu cầu
- [x] Sử dụng hook `useTransition` để bọc lệnh cập nhật URL.
- [x] Thêm prop `isLoading` vào component `PatientSearch`.
- [x] Hiển thị icon xoay (spinner) thay cho icon kính lúp khi đang tải dữ liệu.

## 🛠️ Các bước thực hiện
1. [x] Chỉnh sửa `src/components/features/patients/PatientSearch.tsx`:
    - Cập nhật interface `PatientSearchProps` để nhận thêm `isLoading?: boolean`.
    - Thêm logic hiển thị spinner khi `isLoading` là true.
2. [x] Chỉnh sửa `src/components/features/patients/PatientListClient.tsx`:
    - Khai báo `const [isPending, startTransition] = useTransition();`.
    - Bọc logic `router.replace` bên trong `startTransition`.
    - Truyền `isLoading={isPending}` xuống component `PatientSearch`.

## 📂 File cần chỉnh sửa
- `src/components/features/patients/PatientSearch.tsx`
- `src/components/features/patients/PatientListClient.tsx`

## 🧪 Tiêu chí kiểm thử
- [x] Khi gõ tìm kiếm, icon kính lúp phải chuyển thành icon xoay trong lúc đợi dữ liệu mới từ server.
- [x] Giao diện không bị "đóng băng" (freeze) khi đang fetch kết quả tìm kiếm.

---
Next Phase: [Phase 03: Validation & Final Testing](./phase-03-validation.md)
