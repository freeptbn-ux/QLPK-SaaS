# Phase 01: Fix PatientSearch Core Logic
Status: ✅ Completed
Dependencies: None

## Objective
Khắc phục 2 bug trong `PatientSearch.tsx`:
1. **Input Jump** — Ngăn URL sync ghi đè input khi user đang gõ
2. **Back Button Loop** — Ổn định hóa callback `onSearch` để Effect không bị trigger sai

## Root Cause Recap

### Bug 1: Input Jump
```
User gõ "Tuấn" → debounce → onSearch("Tuấn") → router.replace("?q=Tuấn")
                → User xóa thành "Tu" (đang gõ tiếp)
                → Server trả về kết quả cho "Tuấn"
                → Component re-render, initialValue = "Tuấn"
                → useEffect: setSearchTerm("Tuấn")  ← ❌ GHI ĐÈ "Tu" thành "Tuấn"
```

### Bug 2: Back Button Loop
```
User ở /patients?q=Tuấn → Bấm Back → /patients
→ searchParams thay đổi → handleSearch tạo ref mới
→ Effect 1: setSearchTerm(""), lastSearchedTerm.current = ""
→ Effect 2: onSearch thay đổi ref → trigger
   → debouncedSearchTerm vẫn = "Tuấn" (chưa re-render)
   → gán lastSearchedTerm.current = "Tuấn"
   → gọi onSearch("Tuấn")
   → handleSearch("Tuấn"): "Tuấn" !== currentQ("") → router.replace("?q=Tuấn")
   → ❌ REDIRECT NGƯỢC LẠI → Loop vô hạn
```

## Solution Design

Áp dụng 3 kỹ thuật đồng thời:

### Kỹ thuật 1: `lastSearchedTerm` Ref Guard
Theo dõi giá trị tìm kiếm đã gửi đi gần nhất. Effect đồng bộ ngược từ URL chỉ cập nhật input khi `initialValue` khác với `lastSearchedTerm` — tức là sự thay đổi đến từ bên ngoài (Back/Forward), không phải từ chính user đang gõ.

```tsx
const lastSearchedTerm = useRef(initialValue);

// Effect 1: Chỉ sync từ URL khi có navigation ngoại cảnh
useEffect(() => {
  if (initialValue !== lastSearchedTerm.current) {
    setSearchTerm(initialValue);
    lastSearchedTerm.current = initialValue;
  }
}, [initialValue]);
```

**Tại sao hoạt động:**
- Khi user gõ "Tuấn" → debounce → Effect 2 gán `lastSearchedTerm.current = "Tuấn"` và gọi `onSearch("Tuấn")`
- Server trả về → `initialValue = "Tuấn"` → Effect 1: `"Tuấn" !== "Tuấn"` → **SKIP** (không ghi đè)
- Khi user bấm Back → `initialValue = ""` → Effect 1: `"" !== "Tuấn"` → **UPDATE** (đồng bộ đúng)

### Kỹ thuật 2: `onSearchRef` Callback Stabilization
Dùng `useRef` để giữ tham chiếu ổn định tới `onSearch` callback mới nhất. Loại bỏ `onSearch` khỏi dependency array của Effect 2.

```tsx
// Giữ tham chiếu ổn định
const onSearchRef = useRef(onSearch);
useEffect(() => {
  onSearchRef.current = onSearch;
}, [onSearch]);

// Effect 2: Chỉ depend vào debouncedSearchTerm
useEffect(() => {
  if (debouncedSearchTerm === lastSearchedTerm.current) return;
  lastSearchedTerm.current = debouncedSearchTerm;
  onSearchRef.current(debouncedSearchTerm);
}, [debouncedSearchTerm]);
```

**Tại sao hoạt động:**
- `onSearch` thay đổi ref → chỉ cập nhật `onSearchRef.current`, **KHÔNG** trigger Effect 2
- Effect 2 chỉ chạy khi `debouncedSearchTerm` thực sự thay đổi (user gõ)
- Guard `debouncedSearchTerm === lastSearchedTerm.current` chặn gọi lại `onSearch` nếu giá trị trùng khớp

### Kỹ thuật 3: Guard trùng lặp trong Effect 2
Trước khi gọi `onSearchRef.current()`, kiểm tra xem `debouncedSearchTerm` có khác `lastSearchedTerm.current` không. Nếu trùng → skip.

**Tại sao cần:**
- Khi Back button: Effect 1 gán `lastSearchedTerm.current = ""`
- Sau 300ms, `debouncedSearchTerm` chuyển thành `""`
- Effect 2: `"" === ""` → **SKIP** → không gọi `onSearch("")` → không redirect

## Implementation Steps

### Step 1: Cập nhật imports
- [ ] Thêm `useRef` vào import list

### Step 2: Thêm `lastSearchedTerm` ref
- [ ] Khai báo `const lastSearchedTerm = useRef(initialValue);`

### Step 3: Thêm `onSearchRef` callback stabilization
- [ ] Khai báo `const onSearchRef = useRef(onSearch);`
- [ ] Thêm Effect sync: `useEffect(() => { onSearchRef.current = onSearch; }, [onSearch]);`

### Step 4: Cập nhật Effect đồng bộ ngược từ URL (Effect 1)
- [ ] Thay thế `setSearchTerm(initialValue)` bằng logic guard với `lastSearchedTerm.current`

### Step 5: Cập nhật Effect kích hoạt tìm kiếm (Effect 2)
- [ ] Thêm guard: `if (debouncedSearchTerm === lastSearchedTerm.current) return;`
- [ ] Gọi `onSearchRef.current(debouncedSearchTerm)` thay vì `onSearch(debouncedSearchTerm)`
- [ ] Loại bỏ `onSearch` khỏi dependency array

## Files to Create/Modify

### [MODIFY] `src/components/features/patients/PatientSearch.tsx`

**Before (code hiện tại):**
```tsx
import React, { useState, useEffect } from 'react';
// ...
const [searchTerm, setSearchTerm] = useState(initialValue);
const debouncedSearchTerm = useDebounce(searchTerm, 300);

useEffect(() => {
  setSearchTerm(initialValue);
}, [initialValue]);

useEffect(() => {
  onSearch(debouncedSearchTerm);
}, [debouncedSearchTerm, onSearch]);
```

**After (code sửa):**
```tsx
import React, { useState, useEffect, useRef } from 'react';
// ...
const [searchTerm, setSearchTerm] = useState(initialValue);
const debouncedSearchTerm = useDebounce(searchTerm, 300);

// Ref 1: Track giá trị tìm kiếm đã gửi gần nhất
const lastSearchedTerm = useRef(initialValue);

// Ref 2: Ổn định hóa callback onSearch
const onSearchRef = useRef(onSearch);
useEffect(() => {
  onSearchRef.current = onSearch;
}, [onSearch]);

// Effect 1: Đồng bộ ngược từ URL (chỉ khi navigation ngoại cảnh)
useEffect(() => {
  if (initialValue !== lastSearchedTerm.current) {
    setSearchTerm(initialValue);
    lastSearchedTerm.current = initialValue;
  }
}, [initialValue]);

// Effect 2: Kích hoạt tìm kiếm (chỉ khi user thay đổi input)
useEffect(() => {
  if (debouncedSearchTerm === lastSearchedTerm.current) return;
  lastSearchedTerm.current = debouncedSearchTerm;
  onSearchRef.current(debouncedSearchTerm);
}, [debouncedSearchTerm]);
```

## Test Criteria
- [ ] Gõ "Tuấn" → xóa thành "Tu" nhanh → input KHÔNG bị giật ngược về "Tuấn"
- [ ] Gõ "Tuấn" → bấm Back → URL về `/patients` → input về "" → KHÔNG bị redirect lại `?q=Tuấn`
- [ ] Gõ "Tuấn" → xóa hết → input về "" → tìm kiếm trả về tất cả bệnh nhân
- [ ] Bấm nút "✕" clear → tìm kiếm reset đúng
- [ ] Refresh trang `/patients?q=Tuấn` → input hiển thị "Tuấn" đúng

## Notes
- **Không dùng `useEffectEvent`**: Mặc dù React 19.2+ đã có API này, `useRef` pattern vẫn phổ biến và ổn định hơn. `useEffectEvent` có semantic khác (identity thay đổi mỗi render), dùng sai có thể gây side-effect.
- **ESLint warning**: Khi loại bỏ `onSearch` khỏi dependency, `react-hooks/exhaustive-deps` sẽ cảnh báo. Đây là pattern chấp nhận được, thêm comment `// eslint-disable-next-line react-hooks/exhaustive-deps` nếu cần.

---
Next Phase: → [phase-02-loading-ux.md](./phase-02-loading-ux.md)
