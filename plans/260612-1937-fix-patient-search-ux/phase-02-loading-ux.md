# Phase 02: Add Loading UX to Patient Table
Status: ✅ Completed
Dependencies: Phase 01 (can be done independently but recommended after Phase 01)

## Objective
Thêm visual feedback khi Server đang tải dữ liệu mới sau khi user thay đổi tìm kiếm hoặc chuyển trang. Hiện tại, khi `startTransition` đang pending, bảng danh sách vẫn hiển thị kết quả cũ mà không có dấu hiệu trực quan nào.

## Problem Analysis

### Hiện trạng:
```
User gõ "Tuấn" → startTransition chạy → isPending = true
→ Bảng vẫn hiển thị danh sách cũ y nguyên, KHÔNG mờ đi
→ User không biết hệ thống đang tải → lẫn lộn kết quả cũ/mới
→ Server trả về → bảng đột ngột thay đổi → UX "nhảy" đột ngột
```

### Kỳ vọng:
```
User gõ "Tuấn" → startTransition chạy → isPending = true
→ Bảng mờ nhẹ (opacity 55%) + pointer-events-none
→ User thấy rõ ràng: "đang tải, kết quả đang cập nhật"
→ Server trả về → bảng trở lại bình thường → UX mượt mà
```

## Solution Design

### Approach: Conditional Opacity + Pointer Block
Đây là pattern được Next.js docs và cộng đồng React khuyến nghị:
- Giảm `opacity` của bảng khi `isPending = true` để báo hiệu dữ liệu đang "stale"
- Vô hiệu hóa tương tác (`pointer-events-none`) để tránh user click vào dữ liệu cũ
- Transition mượt (`transition-opacity duration-200`) để không bị giật

### Tại sao KHÔNG dùng Skeleton/Spinner thay thế?
- Skeleton sẽ thay thế toàn bộ bảng → gây layout shift (nhảy)
- Opacity pattern giữ nguyên bảng cũ, chỉ tạo "dim" effect → UX tốt hơn
- Spinner đã có sẵn ở ô search (icon xoay) → đủ để báo hiệu

## Implementation Steps

### Step 1: Wrap bảng trong container có conditional classes
- [x] Thêm `className` conditional vào `<div className="card overflow-hidden">` (line 155 của PatientListClient.tsx)
- [x] Khi `isPending = true`: thêm `opacity-55 pointer-events-none`
- [x] Thêm `transition-opacity duration-200` cho smooth transition

## Files to Create/Modify

### [MODIFY] `src/components/features/patients/PatientListClient.tsx`

**Dòng 155 — Before:**
```tsx
<div className="card overflow-hidden">
```

**Dòng 155 — After:**
```tsx
<div className={cn(
  "card overflow-hidden transition-opacity duration-200",
  isPending && "opacity-55 pointer-events-none"
)}
  aria-busy={isPending}
>
```

### Step 2: Đảm bảo `cn` đã được import
- [x] Kiểm tra import `cn` từ `@/lib/utils/cn` — nếu chưa có, thêm import

**Kiểm tra:** File đã import `cn` chưa? → Cần grep trong file.

### Step 3 (Optional): Thêm aria-busy cho accessibility
- [x] Thêm `aria-busy={isPending}` vào container bảng

**After (hoàn chỉnh):**
```tsx
<div 
  className={cn(
    "card overflow-hidden transition-opacity duration-200",
    isPending && "opacity-55 pointer-events-none"
  )}
  aria-busy={isPending}
>
```

## Test Criteria
- [x] Gõ tìm kiếm → bảng mờ nhẹ ngay lập tức (không chờ server)
- [x] Server trả về → bảng trở lại bình thường (opacity 100%)
- [x] Khi bảng mờ → không click được vào link hoặc nút trong bảng
- [x] Transition mượt mà, không giật
- [x] Chuyển trang (pagination) → bảng cũng mờ nhẹ khi đang tải

## Notes
- `opacity-55` (55%) thay vì `opacity-50` (50%) vì 55% đủ rõ ràng để nhận biết "đang tải" nhưng vẫn đọc được nội dung.
- `pointer-events-none` ngăn user click vào dữ liệu cũ — tránh trường hợp user mở chi tiết bệnh nhân sai.
- Pattern này đã được Next.js official docs khuyến nghị cho `useTransition` + Server Components.

---
Next Phase: → [phase-03-testing.md](./phase-03-testing.md)
