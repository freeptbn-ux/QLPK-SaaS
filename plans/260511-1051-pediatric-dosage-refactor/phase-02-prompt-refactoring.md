# Phase 02: Prompt Refactoring
Status: ✅ Completed
Dependencies: Phase 01

## Objective
Cải tiến Prompt 2 bước (Search & Format) để đảm bảo AI tìm kiếm đúng thông tin nhi khoa và trình bày đúng định dạng yêu cầu.

## Implementation Steps
1. [x] **Refactor Step 1 (Search Prompt):**
    - Yêu cầu AI tìm kiếm chi tiết liều lượng theo cân nặng (mg/kg) và độ tuổi.
    - Yêu cầu liệt kê các mốc tuổi cụ thể (Dưới 1 tuổi, 1-3 tuổi, 3-6 tuổi, v.v.).
2. [x] **Refactor Step 2 (Format Prompt):**
    - Cung cấp ví dụ "Few-shot" về định dạng gạch đầu dòng.
    - Chỉ định cụ thể: Dùng `-` cho mục lớn, `+` cho chi tiết liều.
    - Ép AI chèn `\n` giữa các dòng để Frontend hiển thị xuống dòng.

## Files to Create/Modify
- `src/app/api/medicine-dosage/route.ts` - Thay đổi nội dung `searchSystemPrompt` và `formatUserPrompt`.

## Test Criteria
- [x] AI phản hồi đúng định dạng `-` và `+`.
- [x] Thông tin liều trẻ em xuất hiện ngay đầu tiên trong JSON (nếu có thể sắp xếp hoặc hướng dẫn).
