# Phase 02: Speech Bubble Component (Doraemon Style)

Status: ✅ Completed
Dependencies: Không (UI thuần, có thể làm song song Phase 01)

## Objective

Tạo component **Speech Bubble** (bong bóng hội thoại kiểu truyện tranh Doraemon) để hiển thị kết quả tra cứu liều dùng thuốc. Component phải đẹp, có animation mượt, và **responsive cho cả mobile**.

## Requirements

### Functional
- [x] Hiển thị dạng bong bóng hội thoại với "đuôi" nhọn chỉ về phía tên thuốc
- [x] 3 trạng thái: Loading (đang tra cứu) → Kết quả → Lỗi
- [x] Nút đóng (X) ở góc trên phải
- [x] Click bên ngoài bubble → đóng
- [x] Nhấn ESC → đóng
- [x] Format text: các đầu mục (**bold**) nổi bật, dễ đọc
- [x] Scrollable nếu nội dung dài

### Non-Functional
- [x] Animation: Fade in + scale nhẹ (spring effect kiểu Framer Motion)
- [x] Responsive: Desktop → bubble cạnh tên thuốc, Mobile → bottom sheet
- [x] Breakpoint: < 768px = mobile mode
- [x] Dark mode support
- [x] Không chặn tương tác với form kê đơn (không dùng full overlay)

## Visual Design

### Desktop (≥ 768px) - Speech Bubble
```
                    ┌─────────────────────────────────────┐
                    │  ✕  Tra cứu liều dùng               │
                    │─────────────────────────────────────│
                    │                                     │
                    │  **Liều dùng Atersin theo độ tuổi** │
                    │                                     │
                    │  **Người lớn:**                     │
                    │  Uống 10–15 ml mỗi lần,            │
                    │  ngày 2–3 lần.                      │
                    │                                     │
                    │  **Trẻ em 7–15 tuổi:**              │
                    │  Uống 5–10 ml mỗi lần,             │
                    │  ngày 2–3 lần.                      │
                    │                                     │
                    │  **Cách dùng:**                     │
                    │  Uống trực tiếp, có thể pha loãng  │
                    │  ...                                │
                    └──────────┬──────────────────────────┘
                               │  ← "đuôi" bubble chỉ về tên thuốc
    ┌──────────────────────────┼───────────────────────────
    │ [ATErsin] ←──────────────┘
    │ Hộp 1 chai 60ml
```

**Chi tiết style bubble:**
- Border radius: 16px (bo tròn mềm mại)
- Background: white (light) / slate-800 (dark)
- Shadow: `0 8px 30px rgba(0,0,0,0.12)` (shadow mềm, sâu)
- Border: 1px solid gray-200 (nhẹ)
- "Đuôi" tam giác: CSS triangle hoặc SVG, kích thước ~12px
- Max width: 380px
- Max height: 400px (scroll nếu vượt)
- Vị trí: Xuất hiện phía trên tên thuốc, auto-adjust nếu sát mép trên

### Mobile (< 768px) - Bottom Sheet Bubble
```
    ┌──────────────────────────────────┐
    │  Form kê đơn (mờ nhẹ phía sau)  │
    │                                  │
    │                                  │
    ├──────────────────────────────────┤
    │  ───── (thanh kéo)              │
    │                                  │
    │  ✕  Tra cứu liều: Atersin       │
    │─────────────────────────────────│
    │                                  │
    │  **Liều dùng Atersin...**       │
    │  **Người lớn:**                 │
    │  Uống 10–15 ml...              │
    │                                 │
    │  **Trẻ em 7–15 tuổi:**         │
    │  Uống 5–10 ml...              │
    │  ...                           │
    │                                 │
    │  [  Đóng  ]                    │
    └──────────────────────────────────┘
```

**Chi tiết style mobile:**
- Bottom sheet slide up từ dưới lên
- Border radius top: 20px
- Max height: 70vh
- Backdrop: overlay nhẹ rgba(0,0,0,0.3)
- Swipe down để đóng (optional, nice-to-have)
- Nút "Đóng" rõ ràng ở cuối

### Loading State
```
    ┌─────────────────────────────────┐
    │                                 │
    │    🔍 Đang tra cứu liều dùng   │
    │       Atersin...                │
    │                                 │
    │    ● ● ●  (dot animation)      │
    │                                 │
    └────────┬────────────────────────┘
             │
```

### Error State
```
    ┌─────────────────────────────────┐
    │                                 │
    │    ⚠️ Không tìm thấy thông tin │
    │    liều dùng cho thuốc này.     │
    │                                 │
    │    [ Thử lại ]                  │
    │                                 │
    └────────┬────────────────────────┘
             │
```

## Implementation Steps

### 1. Tạo SpeechBubble Component
- [x] Tạo file `src/components/ui/SpeechBubble.tsx`
- [x] Props: `open`, `onClose`, `anchorRef`, `children`, `loading`, `error`
- [x] Dùng `createPortal` để render bubble ngoài DOM tree (tránh bị clip bởi overflow)
- [x] Responsive detection: `useMediaQuery` hoặc `window.matchMedia('(max-width: 767px)')`

### 2. CSS cho Speech Bubble
- [x] Tạo CSS classes trong component (hoặc inline styles với Tailwind)
- [x] Desktop: absolute positioning relative to anchor element
- [x] Mobile: fixed bottom sheet
- [x] "Đuôi" tam giác bằng CSS `::after` pseudo-element
- [x] Dark mode variants

### 3. Animation (Framer Motion)
- [x] Desktop bubble: `initial={{ opacity: 0, scale: 0.85, y: 10 }}` → `animate={{ opacity: 1, scale: 1, y: 0 }}`
- [x] Mobile sheet: `initial={{ y: '100%' }}` → `animate={{ y: 0 }}`
- [x] Exit animation: reverse
- [x] Spring transition: `type: "spring", damping: 20, stiffness: 300`

### 4. Content Formatter
- [x] Parse Gemini response text thành formatted JSX
- [x] `**text**` → `<strong>` (bold) với màu đậm hơn
- [x] Xuống dòng → `<br />` hoặc paragraphs
- [x] Nhóm nội dung theo sections (Người lớn, Trẻ em, Cách dùng)

### 5. Positioning Logic (Desktop)
- [x] Tính vị trí bubble dựa trên `anchorRef.getBoundingClientRect()`
- [x] Mặc định: hiện phía TRÊN tên thuốc
- [x] Nếu không đủ chỗ phía trên → hiện phía DƯỚI
- [x] Nếu sát mép trái/phải → dịch ngang cho vừa viewport
- [x] Recalculate khi window resize / scroll

### 6. Keyboard & Accessibility
- [x] `ESC` key → đóng
- [x] `aria-label` cho bubble
- [x] Focus trap trong mobile bottom sheet
- [x] `role="dialog"` cho accessibility

## Files to Create/Modify

| File | Action | Mục đích |
|------|--------|----------|
| `src/components/ui/SpeechBubble.tsx` | **Tạo mới** | Component chính |
| `src/hooks/useMediaQuery.ts` | **Tạo mới** (nếu chưa có) | Hook detect mobile/desktop |
| `src/lib/utils/formatDosageText.ts` | **Tạo mới** | Parse markdown-like text → JSX |

## Test Criteria

- [x] Desktop: Bubble hiện đúng vị trí cạnh anchor element
- [x] Desktop: "Đuôi" chỉ đúng hướng về anchor
- [x] Mobile (< 768px): Chuyển sang bottom sheet
- [x] Loading state hiển thị đúng khi đang gọi API
- [x] Error state hiển thị với nút "Thử lại"
- [x] Click outside / ESC → đóng bubble
- [x] Dark mode: Màu sắc đúng
- [x] Scroll nội dung dài trong bubble
- [x] Bold text (**text**) render đúng
- [x] Animation mượt, không giật

## Notes

- Framer Motion đã có trong project (`framer-motion: ^12.38.0`), không cần install thêm
- Component `SpeechBubble` nên tái sử dụng được (generic), không hardcode cho medicine dosage
- "Đuôi" bubble dùng CSS triangle (border trick) đơn giản, reliable hơn SVG
- Mobile bottom sheet KHÔNG dùng full overlay modal → nhẹ hơn, UX tốt hơn

---
Previous Phase: ← [Phase 01: Backend API Route](./phase-01-api-route.md)
Next Phase: → [Phase 03: Tích hợp vào Prescription Form](./phase-03-integration.md)
