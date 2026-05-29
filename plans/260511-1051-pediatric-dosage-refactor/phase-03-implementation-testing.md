# Phase 03: Implementation & Testing
Status: ✅ Completed
Dependencies: Phase 02

## Objective
Triển khai code chính thức và thực hiện kiểm thử lâm sàng (AI Clinical Testing) để đảm bảo tính an toàn và thẩm mỹ.

## Implementation Steps
1. [x] Cập nhật API route với Prompt mới.
2. [x] Chạy bộ Test Suite:
    - `npm test src/app/api/medicine-dosage/__tests__/route.test.ts`
    - Tạo test mới `pediatric-ux.test.ts` để kiểm tra sự tồn tại của các ký tự `-`, `+` trong output.
3. [x] Kiểm tra thực tế với thuốc **ATERsin** (Case user đang quan tâm).

## Files to Create/Modify
- `src/app/api/medicine-dosage/route.ts`
- `src/app/api/medicine-dosage/__tests__/pediatric-ux.test.ts` (New)

## Test Criteria
- [x] 100% test cases pass.
- [x] Output thực tế khớp hoàn toàn với yêu cầu của User về mặt thị giác.
- [x] Không làm gãy tính năng "Tính liều nhanh" hiện có.
