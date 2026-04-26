# Phase 03: UI Primitives Migration (components/ui)
Status: ✅ Completed
Dependencies: Phase 02 (Design System ready)

## Objective
Chuyển đổi tất cả reusable UI components trong `src/components/ui/` từ MUI sang Tailwind CSS. Các components này là **building blocks** được sử dụng lại trong nhiều feature components.

## Requirements
### Functional
- [x] Tất cả UI primitives hoạt động giống hệt phiên bản MUI
- [x] Dark mode hoạt động cho mọi component
- [x] Props API giữ nguyên (hoặc tương thích ngược) để giảm thay đổi ở consumer

### Non-Functional
- [x] Không import bất kỳ thứ gì từ `@mui/*`
- [x] Accessible (ARIA attributes)
- [x] Responsive

## Implementation Steps

### 1. ConfirmDialog.tsx
1. [x] Rewrite `src/components/ui/ConfirmDialog.tsx`:
   - MUI: `Dialog`, `DialogTitle`, `DialogContent`, `DialogContentText`, `DialogActions`, `Button`
   - Tailwind: Custom modal overlay + dialog box
   - Giữ nguyên Props: `open`, `title`, `message`, `onConfirm`, `onCancel`, `confirmLabel`, `cancelLabel`, `loading`
   - Thêm animation: fade-in overlay + scale-up dialog
   - Thêm close on Escape key + click outside

### 2. Toast.tsx
2. [x] Rewrite `src/components/ui/Toast.tsx`:
   - MUI: `Snackbar`, `Alert`, `AlertColor`
   - Tailwind: Custom toast notification + auto-dismiss
   - Giữ nguyên API: `ToastContext`, `ToastProvider`, `showToast(message, severity)`
   - Severity colors: success (green), error (red), warning (amber), info (blue)
   - Animation: slide-in from right + fade-out
   - Position: bottom-right (giữ nguyên)
   - **Lưu ý**: AlertColor type cần được define lại (không import từ MUI)

### 3. EmptyState.tsx
3. [x] Rewrite `src/components/ui/EmptyState.tsx`:
   - MUI: `Box`, `Typography`, `Button`, `Stack`, `InboxIcon` (from @mui/icons-material)
   - Tailwind: `div` + utility classes
   - Icon: dùng `react-icons/hi2` → `HiInbox` hoặc tương đương
   - Giữ nguyên Props: `title`, `description`, `action`

### 4. PageHeader.tsx
4. [x] Rewrite `src/components/ui/PageHeader.tsx`:
   - MUI: `Box`, `Typography`, `Button`, `Stack`
   - Tailwind: Semantic HTML + flex utilities
   - Giữ nguyên Props: `title`, `subtitle`, `action`

### 5. LoadingSkeleton.tsx
5. [x] Rewrite `src/components/ui/LoadingSkeleton.tsx`:
   - MUI: `Skeleton`, `TableRow`, `TableCell`
   - Tailwind: `animate-pulse` + gray placeholder divs
   - **Lưu ý**: Component này render trong `<table>`, nên cần dùng `<tr>`, `<td>` HTML
   - Giữ nguyên Props: `rows`, `columns`

### 6. DateInput.tsx (⚠️ PHỨC TẠP NHẤT)
6. [x] Rewrite `src/components/ui/DateInput.tsx`:
   - MUI: `Box`, `Typography`, `FormControl`, `InputLabel`, `FormHelperText`, `styled`, `useTheme`
   - Đây là component phức tạp nhất vì dùng **MUI `styled()`** extensively
   - Cần rewrite hoàn toàn:
     - `InputContainer` styled component → `div` + Tailwind classes
     - `StyledInput` styled component → `input` + Tailwind classes  
     - `Separator` styled component → `span` + Tailwind classes
   - Focus/error/disabled states qua Tailwind pseudo-classes
   - Giữ nguyên Props API và behavior (3-segment date input)

### 7. CountUp.tsx
7. [x] Review `src/components/ui/CountUp.tsx`:
   - Có thể không dùng MUI trực tiếp
   - Check và update nếu cần

### 8. GlobalShortcuts.tsx
8. [x] Review `src/components/ui/GlobalShortcuts.tsx`:
   - Có thể không dùng MUI trực tiếp
   - Check và update nếu cần

## Files to Modify
| File | Complexity | MUI Components Used |
|------|-----------|---------------------|
| `src/components/ui/ConfirmDialog.tsx` | 🟡 Medium | Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button |
| `src/components/ui/Toast.tsx` | 🟡 Medium | Snackbar, Alert, AlertColor |
| `src/components/ui/EmptyState.tsx` | 🟢 Low | Box, Typography, InboxIcon |
| `src/components/ui/PageHeader.tsx` | 🟢 Low | Box, Typography, Stack |
| `src/components/ui/LoadingSkeleton.tsx` | 🟢 Low | Skeleton, TableRow, TableCell |
| `src/components/ui/DateInput.tsx` | 🔴 High | Box, Typography, FormControl, InputLabel, FormHelperText, styled, useTheme |
| `src/components/ui/CountUp.tsx` | 🟢 Low | Review only |
| `src/components/ui/GlobalShortcuts.tsx` | 🟢 Low | Review only |

## Test Criteria
- [x] ConfirmDialog: mở, đóng, confirm, cancel đều hoạt động
- [x] Toast: hiển thị đúng severity color, auto-dismiss sau 3s
- [x] EmptyState: render đúng title, description, action
- [x] PageHeader: render đúng title, subtitle, action button
- [x] LoadingSkeleton: animate-pulse hoạt động, render đúng số rows/columns
- [x] DateInput: nhập DD/MM/YYYY, auto-focus next field, paste handling, error state
- [x] Tất cả components hiển thị đúng trong Dark mode
- [x] Existing tests trong `__tests__/` pass (sau khi update selectors nếu cần)

## Notes
- **DateInput** là component phức tạp nhất và cần được test kỹ lưỡng. Nó dùng `styled()` API của MUI + `useTheme()`, cần rewrite hoàn toàn.
- Toast component cần tạo lại type `AlertColor` → đổi thành type mới (`ToastSeverity`)  
- Nếu consumer components đang import type `AlertColor` từ `@mui/material/Alert`, cần update import path.
- Các test files (`__tests__/CountUp.test.tsx`, `__tests__/DateInput.test.tsx`) sẽ cần update ở Phase 06.

---
Previous Phase: [phase-02-design-system.md](./phase-02-design-system.md)
Next Phase: [phase-04-layout-navigation.md](./phase-04-layout-navigation.md)
