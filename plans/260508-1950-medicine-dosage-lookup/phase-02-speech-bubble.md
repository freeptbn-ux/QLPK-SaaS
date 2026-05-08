# Phase 02: Speech Bubble Component (Doraemon Style)

Status: ⬜ Pending
Dependencies: Không (UI thuần, có thể làm song song Phase 01)

## Objective

Tạo component **Speech Bubble** (bong bóng hội thoại kiểu truyện tranh Doraemon) để hiển thị kết quả tra cứu liều dùng thuốc. Component phải đẹp, có animation mượt, và **responsive cho cả mobile**.

## Requirements

### Functional
- [ ] Hiển thị dạng bong bóng hội thoại với "đuôi" nhọn chỉ về phía tên thuốc
- [ ] 3 trạng thái: Loading (đang tra cứu) → Kết quả → Lỗi
- [ ] Nút đóng (X) ở góc trên phải
- [ ] Click bên ngoài bubble → đóng
- [ ] Nhấn ESC → đóng
- [ ] Format text: các đầu mục (**bold**) nổi bật, dễ đọc
- [ ] Scrollable nếu nội dung dài

### Non-Functional
- [ ] Animation: Fade in + scale nhẹ (spring effect kiểu Framer Motion)
- [ ] Responsive: Desktop → bubble cạnh tên thuốc, Mobile → bottom sheet
- [ ] Breakpoint: < 768px = mobile mode
- [ ] Dark mode support
- [ ] Không chặn tương tác với form kê đơn (không dùng full overlay)

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
- [ ] Tạo file `src/components/ui/SpeechBubble.tsx`
- [ ] Props: `open`, `onClose`, `anchorRef`, `children`, `loading`, `error`
- [ ] Dùng `createPortal` để render bubble ngoài DOM tree (tránh bị clip bởi overflow)
- [ ] Responsive detection: `useMediaQuery` hoặc `window.matchMedia('(max-width: 767px)')`

### 2. CSS cho Speech Bubble
- [ ] Tạo CSS classes trong component (hoặc inline styles với Tailwind)
- [ ] Desktop: absolute positioning relative to anchor element
- [ ] Mobile: fixed bottom sheet
- [ ] "Đuôi" tam giác bằng CSS `::after` pseudo-element
- [ ] Dark mode variants

### 3. Animation (Framer Motion)
- [ ] Desktop bubble: `initial={{ opacity: 0, scale: 0.85, y: 10 }}` → `animate={{ opacity: 1, scale: 1, y: 0 }}`
- [ ] Mobile sheet: `initial={{ y: '100%' }}` → `animate={{ y: 0 }}`
- [ ] Exit animation: reverse
- [ ] Spring transition: `type: "spring", damping: 20, stiffness: 300`

### 4. Content Formatter
- [ ] Parse Gemini response text thành formatted JSX
- [ ] `**text**` → `<strong>` (bold) với màu đậm hơn
- [ ] Xuống dòng → `<br />` hoặc paragraphs
- [ ] Nhóm nội dung theo sections (Người lớn, Trẻ em, Cách dùng)

### 5. Positioning Logic (Desktop)
- [ ] Tính vị trí bubble dựa trên `anchorRef.getBoundingClientRect()`
- [ ] Mặc định: hiện phía TRÊN tên thuốc
- [ ] Nếu không đủ chỗ phía trên → hiện phía DƯỚI
- [ ] Nếu sát mép trái/phải → dịch ngang cho vừa viewport
- [ ] Recalculate khi window resize / scroll

### 6. Keyboard & Accessibility
- [ ] `ESC` key → đóng
- [ ] `aria-label` cho bubble
- [ ] Focus trap trong mobile bottom sheet
- [ ] `role="dialog"` cho accessibility

## Files to Create/Modify

| File | Action | Mục đích |
|------|--------|----------|
| `src/components/ui/SpeechBubble.tsx` | **Tạo mới** | Component chính |
| `src/hooks/useMediaQuery.ts` | **Tạo mới** (nếu chưa có) | Hook detect mobile/desktop |
| `src/lib/utils/formatDosageText.ts` | **Tạo mới** | Parse markdown-like text → JSX |

## Test Criteria

- [ ] Desktop: Bubble hiện đúng vị trí cạnh anchor element
- [ ] Desktop: "Đuôi" chỉ đúng hướng về anchor
- [ ] Mobile (< 768px): Chuyển sang bottom sheet
- [ ] Loading state hiển thị đúng khi đang gọi API
- [ ] Error state hiển thị với nút "Thử lại"
- [ ] Click outside / ESC → đóng bubble
- [ ] Dark mode: Màu sắc đúng
- [ ] Scroll nội dung dài trong bubble
- [ ] Bold text (**text**) render đúng
- [ ] Animation mượt, không giật

## Notes

- Framer Motion đã có trong project (`framer-motion: ^12.38.0`), không cần install thêm
- Component `SpeechBubble` nên tái sử dụng được (generic), không hardcode cho medicine dosage
- "Đuôi" bubble dùng CSS triangle (border trick) đơn giản, reliable hơn SVG
- Mobile bottom sheet KHÔNG dùng full overlay modal → nhẹ hơn, UX tốt hơn

---
Previous Phase: ← [Phase 01: Backend API Route](./phase-01-api-route.md)
Next Phase: → [Phase 03: Tích hợp vào Prescription Form](./phase-03-integration.md)
