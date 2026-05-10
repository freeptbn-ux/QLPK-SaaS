# Phase 05: Mobile UX Fixes

Status: ✅ Completed
Dependencies: Không (có thể làm độc lập, song song với các phase khác)

## Objective

Sửa 2 vấn đề UX trên mobile:
1. **Ẩn thanh navigation dưới cùng** trên trang kê đơn (`/patients/[id]/prescribe`) — chiếm diện tích màn hình, vướng khi kê đơn
2. **Căn giữa text loading** ("Đang tải danh sách bệnh nhân...") — hiện tại text bị lệch trái

## Requirements

### Fix 1: Ẩn Mobile Bottom Nav trên trang Prescribe
- [x] Trên trang `/patients/[id]/prescribe`, ẩn hoàn toàn thanh MobileNav (bottom tab bar)
- [x] Các trang khác vẫn hiện bình thường
- [x] Không ảnh hưởng desktop sidebar

### Fix 2: Căn giữa Loading Text  
- [x] Text trong `BallLoader` (VD: "Đang tải danh sách bệnh nhân...") phải căn giữa
- [x] Áp dụng cho tất cả các trang dùng `BallLoader` / `LoadingReporter`

## Implementation Steps

### 1. Ẩn MobileNav trên trang Prescribe

**Cách tiếp cận:** MobileNav đang dùng `usePathname()` → thêm logic ẩn khi pathname chứa `/prescribe`.

**File:** `src/components/features/MobileNav.tsx`

**Thay đổi:**
```tsx
// Thêm điều kiện ẩn
const pathname = usePathname()

// Ẩn MobileNav trên trang kê đơn (cần toàn bộ màn hình)
if (pathname.includes('/prescribe')) {
  return null;
}
```

**Tại sao ẩn cả thanh nav?**
- Trang kê đơn là trang nhập liệu chuyên sâu, cần nhiều không gian
- Bottom nav chiếm ~64px quý giá trên mobile
- User có thể quay lại bằng nút "Quay lại" trong form
- Giống UX của các app y tế chuyên nghiệp (form mode = fullscreen)

- [x] Task: Thêm condition `pathname.includes('/prescribe')` → return null
- [x] Task: Verify các trang khác không bị ảnh hưởng

### 2. Căn giữa Loading Text

**File:** `src/components/Loading/BallLoader.module.css`

**Thay đổi:** Thêm `text-align: center` vào class `.text`

```css
.text {
  color: #1e293b;
  font-weight: 600;
  font-size: 0.9375rem;
  letter-spacing: 0.025em;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
  text-align: center;  /* ← THÊM */
}
```

**Tại sao text bị lệch?**
- Container `.container` có `align-items: center` → căn ngang cho flex items
- Nhưng nếu text dài và wrap xuống dòng, nội dung text bên trong vẫn align left
- Thêm `text-align: center` đảm bảo text nhiều dòng cũng căn giữa

- [x] Task: Thêm `text-align: center` vào `.text` trong `BallLoader.module.css`
- [x] Task: Verify text căn giữa trên mobile (375px viewport)

## Files to Modify

| File | Action | Mục đích |
|------|--------|----------|
| `src/components/features/MobileNav.tsx` | **Sửa** | Ẩn nav khi ở trang prescribe |
| `src/components/Loading/BallLoader.module.css` | **Sửa** | Căn giữa loading text |

## Test Criteria

- [x] Mobile `/patients/[id]/prescribe` → KHÔNG hiện bottom nav
- [x] Mobile `/patients` → VẪN hiện bottom nav
- [x] Mobile `/medicines` → VẪN hiện bottom nav  
- [x] Desktop → Sidebar không bị ảnh hưởng
- [x] Loading text "Đang tải danh sách bệnh nhân..." → căn giữa trên mọi viewport
- [x] Loading text ngắn ("Đang tải...") → vẫn căn giữa
- [x] Dark mode loading text → vẫn căn giữa

## Notes

- Fix này rất nhỏ (2 file, ~3 dòng code thay đổi), có thể làm bất kỳ lúc nào
- Không cần install thêm package
- Không ảnh hưởng đến các phase khác

---
Previous Phase: ← [Phase 04: Testing & Polish](./phase-04-testing.md)
