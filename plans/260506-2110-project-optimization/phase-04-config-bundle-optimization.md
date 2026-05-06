# Phase 04: Next.js Config & Bundle Optimization
Status: ✅ Completed
Dependencies: None

## Objective
Tối ưu hóa cấu hình Next.js để giảm dung lượng file JavaScript gửi xuống trình duyệt và tăng tốc độ xử lý.

## Requirements
### Functional
- [x] Bật các tính năng tối ưu hóa import trong `next.config.ts`.
- [x] Đảm bảo Gzip/Brotli compression được kích hoạt.

## Implementation Steps
1. [x] Chỉnh sửa `next.config.ts`:
   - Thêm `experimental.optimizePackageImports` cho: `lucide-react`, `recharts`, `dayjs`, `react-icons/hi2`.
   - Thêm `compress: true`.

## Files to Create/Modify
- `next.config.ts`

## Test Criteria
- [x] Project vẫn build thành công (`npm run build`).
- [x] Kiểm tra bundle size (nếu có thể) thấy giảm nhẹ dung lượng các chunk liên quan đến UI library.

---
Next Phase: [Phase 05: Verification](phase-05-verification.md)
