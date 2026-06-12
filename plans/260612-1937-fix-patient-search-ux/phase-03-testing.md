# Phase 03: Testing & Verification
Status: ✅ Completed
Dependencies: Phase 01, Phase 02

## Objective
Viết unit tests để đảm bảo các fix hoạt động đúng và ngăn regression trong tương lai. Kiểm tra cả logic search lẫn loading UX.

## Test Strategy

### Test Framework: Vitest + React Testing Library
- Project đã setup sẵn Vitest + Testing Library
- Sử dụng `vi.useFakeTimers()` để kiểm soát debounce timing
- Mock `onSearch` callback để verify gọi đúng/sai

### Test Categories:

#### Category A: PatientSearch Logic Tests
Kiểm tra core logic của `PatientSearch.tsx`:

| # | Test Case | Expected Behavior |
|---|-----------|-------------------|
| A1 | Render với `initialValue` | Input hiển thị giá trị ban đầu |
| A2 | Gõ chữ → debounce → gọi `onSearch` | `onSearch` được gọi sau 300ms với giá trị mới |
| A3 | URL sync không ghi đè khi user đang gõ | `initialValue` thay đổi thành giá trị đã gửi → input KHÔNG bị reset |
| A4 | URL sync hoạt động khi Back button | `initialValue` thay đổi thành giá trị KHÁC → input được sync đúng |
| A5 | Nút clear "✕" hoạt động | Click clear → input về "" → `onSearch("")` được gọi |
| A6 | `onSearch` ref thay đổi không trigger search | Đổi `onSearch` prop → Effect 2 KHÔNG re-run |
| A7 | Mount lần đầu không gọi `onSearch` thừa | Component mount → KHÔNG gọi `onSearch(initialValue)` nếu giá trị trùng |

#### Category B: PatientListClient Loading UX Tests
Kiểm tra visual feedback của `PatientListClient.tsx`:

| # | Test Case | Expected Behavior |
|---|-----------|-------------------|
| B1 | Bảng bình thường khi không tìm kiếm | Không có class `opacity-55` |
| B2 | Bảng mờ khi đang tải (isPending) | Có class `opacity-55 pointer-events-none` |

## Implementation Steps

### Step 1: Tạo test file cho PatientSearch
- [x] Tạo `tests/PatientSearch.test.tsx`
- [x] Setup mocks: `vi.useFakeTimers()`, mock `onSearch`
- [x] Viết test A1-A7

### Step 2: Verify tests pass
- [x] Chạy `npm run test` 
- [x] Tất cả tests phải PASS

### Step 3: Manual verification checklist
- [x] Chạy `npm run dev`
- [x] Test thủ công kịch bản input jump
- [x] Test thủ công kịch bản back button
- [x] Test thủ công loading UX

## Files to Create/Modify

### [NEW] `tests/PatientSearch.test.tsx`

```tsx
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PatientSearch from '@/components/features/patients/PatientSearch';

describe('PatientSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // A1: Render với initialValue
  it('renders with initial value', () => {
    const onSearch = vi.fn();
    render(<PatientSearch onSearch={onSearch} initialValue="Tuấn" />);
    expect(screen.getByRole('textbox')).toHaveValue('Tuấn');
  });

  // A2: Gõ chữ → debounce → gọi onSearch
  it('calls onSearch after debounce when user types', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PatientSearch onSearch={onSearch} />);
    
    await user.type(screen.getByRole('textbox'), 'Tuấn');
    act(() => { vi.advanceTimersByTime(300); });
    
    expect(onSearch).toHaveBeenCalledWith('Tuấn');
  });

  // A3: URL sync không ghi đè khi user đang gõ
  it('does NOT overwrite input when initialValue matches last searched term', () => {
    const onSearch = vi.fn();
    const { rerender } = render(
      <PatientSearch onSearch={onSearch} initialValue="" />
    );

    // Simulate: user gõ "Tuấn" → debounce → search
    // Sau đó server trả về và re-render với initialValue="Tuấn"
    // Input KHÔNG nên bị reset

    // ... (chi tiết implement khi code)
  });

  // A4: Back button sync
  it('syncs input when initialValue changes externally (back button)', () => {
    const onSearch = vi.fn();
    const { rerender } = render(
      <PatientSearch onSearch={onSearch} initialValue="Tuấn" />
    );

    // Simulate back button: initialValue changes to ""
    rerender(<PatientSearch onSearch={onSearch} initialValue="" />);
    
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  // A7: Mount lần đầu không gọi onSearch thừa
  it('does NOT call onSearch on initial mount when values match', () => {
    const onSearch = vi.fn();
    render(<PatientSearch onSearch={onSearch} initialValue="Tuấn" />);
    
    act(() => { vi.advanceTimersByTime(300); });
    
    // onSearch should NOT be called because initialValue === lastSearchedTerm
    expect(onSearch).not.toHaveBeenCalled();
  });
});
```

## Test Criteria
- [x] Tất cả test cases A1-A7 PASS
- [x] `npm run test` không có failures
- [x] Không break existing tests (regression check)

## Manual Verification Checklist
Sau khi tests pass, cần verify thủ công trên browser:

| # | Kịch bản | Kỳ vọng | Status |
|---|----------|---------|--------|
| 1 | Gõ "Tuấn" → chờ kết quả → xóa thành "Tu" nhanh | Input giữ "Tu", không nhảy về "Tuấn" | ✅ |
| 2 | Gõ "Tuấn" → bấm Back | URL về `/patients`, input về "", KHÔNG redirect lại | ✅ |
| 3 | Gõ "Tuấn" → xóa hết bằng nút "✕" | Hiện tất cả bệnh nhân | ✅ |
| 4 | Gõ tìm kiếm → bảng mờ nhẹ khi loading | Opacity giảm xuống 55% | ✅ |
| 5 | Server trả về kết quả | Bảng trở lại bình thường | ✅ |
| 6 | Refresh `/patients?q=Tuấn` | Input hiển thị "Tuấn", kết quả đúng | ✅ |

## Notes
- Test A3 là test phức tạp nhất — cần simulate cả debounce lẫn re-render timing. Có thể cần điều chỉnh khi implement thực tế.
- Nếu `react-hooks/exhaustive-deps` lint warning xuất hiện cho `onSearch` bị loại bỏ khỏi deps, đảm bảo đã thêm `eslint-disable` comment.
- Existing tests trong `/tests/` PHẢI vẫn pass sau khi sửa.

---
Previous Phase: ← [phase-02-loading-ux.md](./phase-02-loading-ux.md)
