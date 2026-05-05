# Phase 03: Silent Loading Segments

## Objective
Loại bỏ việc render UI trực tiếp trong các file `loading.tsx` để tránh hiện tượng "2 loader" xuất hiện cùng lúc. Các file này chỉ có nhiệm vụ báo cáo trạng thái loading và text hiển thị cho hệ thống toàn cục.

## Implementation Steps
1. [x] Tạo component `src/components/Loading/LoadingReporter.tsx`.
2. [x] Component này sử dụng `useEffect` để:
    - Khi mount: gọi `setIsStreaming(true)` và `setLoadingText(props.text)`.
    - Khi unmount: gọi `setIsStreaming(false)`.
3. [x] Cập nhật tất cả các file `loading.tsx` để trả về `<LoadingReporter text="..." />`.

## Files to Create/Modify
- `src/components/Loading/LoadingReporter.tsx` (New)
- Tất cả các file `loading.tsx` (Root, Dashboard, Medicines, Patients, v.v.)

## Test Criteria
- [ ] Khi chuyển tab Dashboard, text hiển thị trên GlobalLoader thay đổi tương ứng ("Đang tải dữ liệu...", "Đang tải danh sách...", v.v.)
- [ ] UI không còn hiện tượng loader inline lồng trong loader overlay.

