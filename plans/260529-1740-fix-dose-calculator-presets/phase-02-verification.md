# Phase 02: Verification & Testing
Status: ✅ Completed
Dependencies: Phase 01

## Objective
Kiểm chứng tính năng hoạt động hoàn hảo và đảm bảo không phá vỡ các test case hiện tại.

## Requirements
- [x] Chạy bộ kiểm thử tự động (Unit test) hiện tại của DoseCalculator để xác nhận tính ổn định.
- [x] Đảm bảo chức năng chọn thuốc mẫu cập nhật chính xác các trường input (hàm lượng, thể tích, liều chuẩn) và tính toán ra kết quả đúng.

## Implementation Steps
1. Chạy các lệnh kiểm thử tự động `npm run test` hoặc `npx vitest run src/components/features/dose-calculator/__tests__/DoseCalculator.test.tsx`.
2. Xác minh các test case cũ của `DoseCalculator.test.tsx` tiếp tục pass (chúng đã mock `getDrugPresets` để không bị gọi ở mức component con, điều này rất chuẩn xác vì prop được truyền trực tiếp từ Server Component).

## Files to Create/Modify
- Không có (Chỉ thực hiện chạy kiểm thử và xác minh giao diện)

## Test Criteria
- [x] Lệnh kiểm thử `npm run test` hoàn thành thành công 100%.
- [x] Kiểm tra xem dropdown chọn thuốc mẫu có đầy đủ danh mục thuốc đã lưu chưa.
- [x] Khi chọn một thuốc mẫu, các ô "Hàm lượng (mg)", "Thể tích (ml)" và "Liều (mg/kg)" tự động được điền đúng giá trị.
- [x] Bấm "TÍNH KẾT QUẢ" hiển thị đúng liều khuyên dùng.
