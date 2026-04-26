# Phase 02: Fix Autocomplete Input (MUI v9)

Status: ✅ Complete
Dependencies: Phase 01

## Objective
Sửa lỗi `MUI: Unable to find the input element` trong component `MedicineAutocomplete`.

## Root Cause
Trong MUI v9, `AutocompleteRenderInputParams` cung cấp `params.slotProps` (không còn `params.InputProps`).
Code cũ dùng `(params as any).InputProps` cast thủ công → mất ref → MUI không tìm được input element.

## Changes Made
- [x] `src/components/features/prescriptions/MedicineAutocomplete.tsx`: Sửa `renderInput` dùng đúng `params.slotProps.input` thay vì `(params as any).InputProps`.

## Pattern Áp Dụng

**Trước (lỗi - cast sai):**
```tsx
renderInput={(params) => (
  <TextField
    {...params}
    slotProps={{
      input: {
        ...(params as any).InputProps,  // ❌ sai key, mất ref
        endAdornment: (...)
      },
    }}
  />
)}
```

**Sau (MUI v9 chuẩn):**
```tsx
renderInput={(params) => (
  <TextField
    {...params}
    slotProps={{
      ...params.slotProps,  // ✅ giữ nguyên tất cả slots
      input: {
        ...params.slotProps.input,  // ✅ giữ ref + class + handlers
        endAdornment: (
          <>
            {loading ? <CircularProgress size={20} /> : null}
            {params.slotProps.input.endAdornment}
          </>
        ),
      },
    }}
  />
)}
```

## Test Criteria
- [x] Console không còn báo lỗi `Unable to find the input element`.
- [x] Autocomplete vẫn tìm kiếm và chọn thuốc bình thường.
- [x] Build production pass.

---
Next Phase: [phase-03-verification.md](./phase-03-verification.md)
