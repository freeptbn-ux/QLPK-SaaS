# Plan: Fix Patient Search UX Bugs
Created: 2026-06-12 19:37
Status: ✅ Completed

## Overview

Khắc phục 3 lỗi UX nghiêm trọng trong chức năng tìm kiếm bệnh nhân tại `/patients`:

1. **Input Jump Bug** — Ô input bị giật ngược (jump) khi người dùng đang gõ, do `useEffect` đồng bộ ngược từ URL đè lên trạng thái local.
2. **Back Button Loop Bug** — Nút Back trình duyệt không hoạt động do `onSearch` trong dependency array gây trigger Effect sai thời điểm.
3. **Missing Loading Feedback** — Bảng kết quả không có visual feedback khi Server đang tải dữ liệu mới.

## Root Cause Analysis

### Bug 1: Input Jump (Blind State Sync)
- **File:** `src/components/features/patients/PatientSearch.tsx`
- **Nguyên nhân:** `useEffect(() => setSearchTerm(initialValue), [initialValue])` ghi đè trạng thái local mỗi khi Server trả về response mới, kể cả khi user đang gõ dở.

### Bug 2: Back Button Loop
- **File:** `src/components/features/patients/PatientSearch.tsx`
- **Nguyên nhân:** `onSearch` nằm trong dependency array của Effect kích hoạt tìm kiếm. Khi user bấm Back, `searchParams` thay đổi → `handleSearch` (useCallback) tạo ref mới → Effect 2 bị trigger với `debouncedSearchTerm` cũ → gọi `onSearch("Tuấn")` → redirect ngược lại.

### Bug 3: No Loading State on Table
- **File:** `src/components/features/patients/PatientListClient.tsx`
- **Nguyên nhân:** Khi `startTransition` đang pending, bảng danh sách vẫn hiển thị bình thường, không có dấu hiệu trực quan nào cho thấy đang tải dữ liệu mới.

## Tech Stack Context
- **React:** 19.2.4 (supports `useEffectEvent`)
- **Next.js:** 16.2.4 (App Router, Server Components)
- **Testing:** Vitest + React Testing Library

## Research Findings

### Best Practices (từ React docs & cộng đồng):

| Pattern | Khuyến nghị | Áp dụng |
|---------|-------------|---------|
| `useEffectEvent` (React 19.2+) | ✅ Official API cho callback stabilization | Có thể dùng, nhưng `useRef` pattern vẫn phổ biến hơn và ít rủi ro hơn |
| `useRef` Latest Callback | ✅ Community standard, React team recommended | **Chọn pattern này** — stable, dễ hiểu, không phụ thuộc experimental API |
| `defaultValue` (Uncontrolled) | ✅ Next.js docs recommend | Không áp dụng — project cần controlled input để có nút clear "✕" |
| `useDebouncedCallback` | ✅ Cleaner alternative | Không cần thêm dep — project đã có `useDebounce` hook hoạt động tốt |
| `isPending` + opacity | ✅ UX standard | **Chọn pattern này** cho loading state |

### Quyết định kỹ thuật:
- **Dùng `useRef` pattern** (không dùng `useEffectEvent`) vì:
  - Ổn định hơn, đã được battle-tested trong cộng đồng
  - Không phụ thuộc vào API có thể thay đổi behavior trong tương lai
  - Dễ hiểu, dễ maintain cho team
- **Giữ controlled input** (`value` thay vì `defaultValue`) vì cần nút clear "✕"

## Phases

| Phase | Name | Status | Files Changed | Complexity |
|-------|------|--------|---------------|------------|
| 01 | Fix PatientSearch Core Logic | ✅ Completed | 1 file | Medium |
| 02 | Add Loading UX to Table | ✅ Completed | 1 file | Low |
| 03 | Testing & Verification | ✅ Completed | 2 test files | Medium |

**Tổng:** 3 phases | ~4 files affected | Ước tính: 1 session

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
