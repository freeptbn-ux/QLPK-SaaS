# Phase 02: Fix Next.js Params Pattern - Cập nhật Prescribe Page
**Status:** ✅ Completed
**Dependencies:** Phase 01 (nên fix query trước)
**Ưu tiên:** 🟡 Medium - Trang kê đơn sẽ crash trên Next.js 16

## Objective
Cập nhật trang prescribe page từ pattern `params` cũ (đồng bộ) sang pattern mới (Promise-based) theo yêu cầu của Next.js 15+/16.

## Root Cause Analysis

### Vấn đề
```typescript
// src/app/(dashboard)/patients/[id]/prescribe/page.tsx

// ❌ Pattern CŨ (Next.js 14 trở về trước):
interface PrescribePageProps {
  params: {
    id: string;
  };
}
export default async function PrescribePage({ params }: PrescribePageProps) {
  const patientId = parseInt(params.id);  // Truy cập trực tiếp
```

### Pattern ĐÚNG cho Next.js 16
```typescript
// ✅ Pattern MỚI (Next.js 15+):
interface PrescribePageProps {
  params: Promise<{ id: string }>;
}
export default async function PrescribePage({ params }: PrescribePageProps) {
  const { id } = await params;  // Phải await
  const patientId = parseInt(id);
```

### So sánh
File `[id]/page.tsx` (trang chi tiết) đã dùng đúng pattern mới:
```typescript
// ✅ Đã đúng
params: Promise<{ id: string }>
const { id } = await params;
```

Nhưng file `[id]/prescribe/page.tsx` vẫn dùng pattern cũ.

## Requirements
### Functional
- [x] Cập nhật interface `PrescribePageProps` dùng `Promise<{ id: string }>`
- [x] Cập nhật function body dùng `await params`
- [x] Trang prescribe phải load đúng thông tin bệnh nhân

### Non-Functional
- [ ] Không có TypeScript error
- [ ] Tuân thủ Next.js 16 conventions

## Implementation Steps
1. [x] Mở file `src/app/(dashboard)/patients/[id]/prescribe/page.tsx`
2. [x] Sửa interface: `params: { id: string }` → `params: Promise<{ id: string }>`
3. [x] Sửa body: thêm `const { id } = await params;` thay cho `parseInt(params.id)`
4. [x] Build verify: `npm run build`

## Files to Modify
- `src/app/(dashboard)/patients/[id]/prescribe/page.tsx` - Cập nhật params pattern

## Code Change Preview

```diff
 interface PrescribePageProps {
-  params: {
-    id: string;
-  };
+  params: Promise<{ id: string }>;
 }
 
 export default async function PrescribePage({ params }: PrescribePageProps) {
-  const patientId = parseInt(params.id);
+  const { id } = await params;
+  const patientId = parseInt(id);
```

## Test Criteria
- [x] `npm run build` thành công, không có lỗi TypeScript
- [x] Trang `/patients/767/prescribe` load đúng (hiện form kê đơn, thông tin BN)
- [x] Nhấn "Kê đơn mới" từ trang chi tiết BN → điều hướng đúng

---
Next Phase: → phase-03-fix-schema.md
