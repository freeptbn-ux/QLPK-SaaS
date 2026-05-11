# Plan: Pediatric Dosage Refactor (UX & Clinical Accuracy)
Created: 2026-05-11 10:52
Status: ✅ Done

## Overview
Cải tiến tính năng tra cứu liều dùng thuốc bằng AI để tập trung vào trải nghiệm của bác sĩ nhi khoa. Thay đổi định dạng hiển thị từ văn bản thuần sang cấu trúc phân cấp (Age-based) với các gạch đầu dòng rõ ràng, dễ đọc, dễ tra cứu nhanh.

## Tech Stack
- **AI Integration:** Gemini 2.5 Flash-Lite (Two-Step Architecture)
- **Validation:** Zod (medicineDosageOutputSchema)
- **Backend:** Next.js API Routes

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | [Schema & Standard Design](./phase-01-schema-design.md) | ✅ Completed | 100% |
| 02 | [Prompt Refactoring](./phase-02-prompt-refactoring.md) | ✅ Completed | 100% |
| 03 | [Implementation & Testing](./phase-03-implementation-testing.md) | ✅ Completed | 100% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`

## Design Principles
1. **Pediatric First:** Ưu tiên hiển thị liều trẻ em lên đầu và chi tiết theo độ tuổi/cân nặng.
2. **Scanability:** Sử dụng `-` cho ý chính và `+` cho ý phụ. Phân tách các phần bằng dòng trắng.
3. **Clinical Standard:** Tham chiếu cấu trúc từ Dược thư quốc gia Việt Nam.
