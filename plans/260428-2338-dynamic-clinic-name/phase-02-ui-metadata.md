# Phase 02: Cập nhật UI Components & Metadata
Status: ✅ Completed
Dependencies: phase-01-context

## Objective
Sử dụng dữ liệu `clinic_name` đã có từ `SettingsContext` (và trực tiếp từ Server Actions) để thay thế cụm từ "QLPK SaaS" được hardcode ở UI và thẻ metadata `<title>` của tất cả các page.

## Requirements
### Functional
- [x] `Sidebar.tsx`: Thay "QLPK SaaS" ở header bản mobile bằng `clinic_name` động. Nếu không có giá trị, fallback về "Phòng khám".
- [x] `TopBar.tsx`: Thay default title "QLPK SaaS" bằng `clinic_name` thông qua Context (vì component này hiện đang xài client hook).
- [x] Các trang thống kê (`statistics/page.tsx`), thuốc (`medicines/page.tsx`), tính liều (`dose-calculator/page.tsx`): Sử dụng `generateMetadata` thay cho `export const metadata` static.
- [x] Thay đổi metadata mặc định ở Root Layout (`app/layout.tsx`) để nhận `clinic_name`.

## Implementation Steps
1. [x] Trong `src/components/features/Sidebar.tsx`, sử dụng hook `useSettings()` để lấy `clinic_name`, thay thế cho chữ "QLPK SaaS" ở dòng 37.
2. [x] Trong `src/components/features/TopBar.tsx`, sử dụng hook `useSettings()` để override prop `title` nếu có `clinic_name` hợp lệ (dòng 51).
3. [x] Trong `src/app/(dashboard)/statistics/page.tsx`, thêm hàm `export async function generateMetadata(): Promise<Metadata>` gọi `getAllSettings()` để trả về title động: `Thống kê - ${settings.clinic_name || 'Phòng khám'}`.
4. [x] Lặp lại bước 3 với `src/app/(dashboard)/medicines/page.tsx` và `src/app/(dashboard)/dose-calculator/page.tsx`. Tương tự với layout.
5. [x] *Tuỳ chọn*: Sửa metadata.title.template ở `src/app/layout.tsx` nếu phù hợp để áp dụng trên toàn cục.

## Files to Create/Modify
- `src/components/features/Sidebar.tsx` - [Modify] Đọc context.
- `src/components/features/TopBar.tsx` - [Modify] Đọc context.
- `src/app/(dashboard)/statistics/page.tsx` - [Modify] Dùng `generateMetadata()`.
- `src/app/(dashboard)/medicines/page.tsx` - [Modify] Dùng `generateMetadata()`.
- `src/app/(dashboard)/dose-calculator/page.tsx` - [Modify] Dùng `generateMetadata()`.

## Test Criteria
- [x] Đổi tên phòng khám trong Settings (Cài đặt).
- [x] F5 lại trang, thấy TopBar và tiêu đề thẻ (Browser Tab) cập nhật ngay lập tức.
- [x] Trên mobile, Sidebar (Menu vuốt) hiển thị tên phòng khám chính xác.

---
Next Phase: (End of plan)
