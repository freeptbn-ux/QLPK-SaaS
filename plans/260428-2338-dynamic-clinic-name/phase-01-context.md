# Phase 01: Cài đặt Settings Context & Layout Provider
Status: ✅ Completed
Dependencies: None

## Objective
Tạo một React Context (`SettingsProvider`) để lưu trữ `clinic_name` (và các cài đặt khác) ở phía client mà không cần prop-drilling, đồng thời cung cấp khả năng fetch dữ liệu này từ server-side ở Root Layout.

## Requirements
### Functional
- [x] Xây dựng một file context để quản lý trạng thái của Settings.
- [x] Provider phải nhận `initialSettings` truyền từ Server Component.
- [x] Cập nhật `src/app/(dashboard)/layout.tsx` (hoặc root tương ứng) để fetch `getAllSettings()` từ `settings.ts` và wrap ứng dụng bằng `<SettingsProvider>`.

## Implementation Steps
1. [x] Tạo file `src/contexts/SettingsContext.tsx`. Khởi tạo context với `clinic_name` và các properties cần thiết, đồng thời export hook `useSettings()`.
2. [x] Trong `src/app/(dashboard)/layout.tsx`, chuyển hàm này thành async component nếu cần, import `getAllSettings` từ `actions/settings.ts`, gọi hàm để lấy data.
3. [x] Wrap `children` trong Layout bằng `<SettingsProvider initialSettings={settings}>`.

## Files to Create/Modify
- `src/contexts/SettingsContext.tsx` - [Create] Cung cấp global context cho biến môi trường/cài đặt.
- `src/app/(dashboard)/layout.tsx` - [Modify] Fetch cài đặt bằng server action và truyền vào provider.

## Test Criteria
- [x] Ứng dụng không bị lỗi sau khi thêm context.
- [x] Có thể gọi `useSettings()` từ một Component bất kỳ bên trong DashboardLayout và lấy được các giá trị trong Settings DB (ví dụ: `clinic_name`).

---
Next Phase: phase-02-ui-metadata.md
