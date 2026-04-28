# Phase 01: Cập nhật UI danh sách bệnh nhân
Status: ✅ Complete
Dependencies: None

## Objective
Thay đổi hiển thị tên bệnh nhân trong `PatientList.tsx` thành dạng thẻ `<Link>` để người dùng có thể click trực tiếp vào tên và chuyển đến trang chi tiết của bệnh nhân.

## Requirements
### Functional
- [x] Tên bệnh nhân ở giao diện Desktop (bảng) có thể click và chuyển hướng tới `/patients/[id]`.
- [x] Tên bệnh nhân ở giao diện Mobile (dạng thẻ) có thể click và chuyển hướng tới `/patients/[id]`.

### Non-Functional
- [x] UI/UX: Khi hover (rẽ chuột) vào tên bệnh nhân, tên sẽ chuyển màu (dùng màu primary) và có gạch chân hoặc đổi màu để người dùng nhận biết rõ ràng đây là một đường dẫn có thể bấm được.

## Implementation Steps
1. [x] Mở file `src/components/features/patients/PatientList.tsx`.
2. [x] Tìm phần hiển thị tên ở Desktop: `<td>{patient.name}</td>`.
3. [x] Bọc `{patient.name}` bằng `<Link href={\`/patients/\${patient.id}\`}>`.
4. [x] Thêm CSS classes để tạo hiệu ứng hover (ví dụ: `hover:text-primary-600 hover:underline transition-colors`).
5. [x] Áp dụng thay đổi tương tự cho phần hiển thị tên ở Mobile (`<h3>{patient.name}</h3>`).

## Files to Create/Modify
- `src/components/features/patients/PatientList.tsx` - Cập nhật component hiển thị tên bệnh nhân thành dạng Link.

## Test Criteria
- [x] Click vào tên bệnh nhân trên Desktop, chuyển trang thành công.
- [x] Click vào tên bệnh nhân trên Mobile, chuyển trang thành công.
- [x] Hover vào tên có hiệu ứng đúng chuẩn để người dùng nhận diện.

---
Next Phase: Hoàn thành tính năng
