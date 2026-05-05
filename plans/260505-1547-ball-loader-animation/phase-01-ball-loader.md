# Phase 01: Thiết kế component BallLoader

## Objective
Tạo ra component loading mới với hiệu ứng 4 quả bóng xoay tròn và 4 màu sắc khác nhau, kèm theo chữ "Đang tải" ở dưới.

## Requirements
### Functional
- [x] Render 4 quả bóng nhỏ với các màu: Blue, Red, Yellow, Green.
- [x] Thiết kế dạng **Flat 2D** (màu đơn sắc, không bóng đổ/gradient) để tối ưu dung lượng và hiệu năng.
- [x] Hiệu ứng xoay tròn liên tục mượt mà.
- [x] Dòng chữ "Đang tải" hiển thị phía dưới animation.
- [x] Hỗ trợ các kích thước (sm, md, lg) và biến thể (overlay toàn màn hình hoặc inline).
- [x] Đảm bảo hiển thị tốt trên Mobile (kích thước bóng và font chữ tự điều chỉnh linh hoạt).

### Non-Functional
- [x] Hiệu suất cao (dùng CSS animation thay vì JS animation nếu có thể).
- [x] Hỗ trợ Dark mode (màu chữ "Đang tải" thay đổi theo theme).

## Implementation Steps
1. [x] Tạo file `src/components/Loading/BallLoader.tsx`.
2. [x] Tạo file `src/components/Loading/BallLoader.module.css` định nghĩa animation xoay tròn và màu sắc.
3. [x] Cấu hình component để nhận props `isOverlay` (để dùng cho navigation loading).

## Files to Create/Modify
- `src/components/Loading/BallLoader.tsx` - Component chính.
- `src/components/Loading/BallLoader.module.css` - Styles và animation.

## Test Criteria
- [x] Component hiển thị đúng 4 quả bóng màu sắc.
- [x] Xoay tròn liên tục không bị giật.
- [x] Chữ "Đang tải" xuất hiện đúng vị trí.
