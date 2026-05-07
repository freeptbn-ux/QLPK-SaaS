# Phase 02: Middleware + Auth Optimization

Status: ⬜ Pending  
Dependencies: Phase 01 (recommended, not required)  
Effort: ~45 phút  
Fixes: 🟡 Không có middleware.ts + 🔴 Auth overhead (getUser gọi nhiều lần)

---

## Objective

1. Tạo `middleware.ts` chuẩn Supabase SSR để xử lý session refresh ở tầng middleware
2. Tạo shared cached auth helper để `getUser()` chỉ gọi network **1 lần duy nhất** per request
3. Refactor tất cả server actions dùng shared auth thay vì gọi `getUser()` riêng lẻ

---

## Task 1: Tạo `middleware.ts`

### Vấn đề hiện tại

Dự án **không có `middleware.ts`** → mỗi server action phải tự handle token refresh → tăng latency + nguy cơ session hết hạn.

### Giải pháp

Tạo `src/middleware.ts` theo pattern chuẩn Supabase SSR:
- Refresh session token tự động
- Redirect unauthenticated users → `/login`
- Protect tất cả routes `/patients/*`, `/medicines/*`, `/settings/*`, etc.

### Implementation Steps

- [ ] **1.1** Tạo file `src/lib/supabase/middleware.ts` — helper function `updateSession()`
  - Đọc cookies, refresh token nếu cần
  - Redirect về `/login` nếu không có session (cho protected routes)
  - Cho phép truy cập public routes (`/login`, `/register`, `/`)
- [ ] **1.2** Tạo file `src/middleware.ts` — export middleware function
  - Gọi `updateSession()` từ helper
  - Config `matcher` để chỉ chạy trên routes cần thiết (tránh static files)
- [ ] **1.3** Test: Truy cập `/patients` khi chưa login → redirect về `/login`
- [ ] **1.4** Test: Truy cập `/patients` khi đã login → vào bình thường

### Files to Create

| File | Mục đích |
|------|----------|
| `src/lib/supabase/middleware.ts` | Helper `updateSession()` cho middleware |
| `src/middleware.ts` | Next.js middleware chính |

---

## Task 2: Tạo Shared Cached Auth Helper

### Vấn đề hiện tại

Mỗi server action gọi `auth.getUser()` riêng:
```tsx
// Trong getAllSettings():
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();  // ~50-100ms network

// Trong getPatientById():
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();  // ~50-100ms network (LẶP LẠI!)
```

Trong 1 page load `/patients/[id]`: ít nhất **2 lần** `getUser()` = ~100-200ms overhead.

### Giải pháp

Tạo `getAuthUser()` bọc bằng React `cache()`:
```tsx
// src/lib/supabase/auth.ts
import { cache } from 'react';
import { createClient } from './server';

export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return { user, supabase };
});
```

React `cache()` đảm bảo trong cùng 1 server request, hàm chỉ chạy **1 lần duy nhất** dù gọi từ nhiều nơi.

### Implementation Steps

- [ ] **2.1** Tạo file `src/lib/supabase/auth.ts` với hàm `getAuthUser()`
  - Return cả `user` và `supabase` client (để reuse, không tạo client mới)
  - Bọc bằng React `cache()`
  - Throw error nếu unauthorized
- [ ] **2.2** Refactor `src/actions/patients.ts`:
  - Thay tất cả block `createClient() + auth.getUser()` bằng `getAuthUser()`
  - Các functions cần refactor: `getPatientsPaginated`, `searchPatients`, `getPatientById`, `getPatientPrescriptionsPaginated`, `addPatient`, `updatePatient`, `deletePatient`, `getTotalPatientCount`, `getMedicineUsageByPatient`, `getPotentialDuplicates`, `mergePatients`
- [ ] **2.3** Refactor `src/actions/settings.ts`:
  - Thay tất cả block `createClient() + auth.getUser()` bằng `getAuthUser()`
  - Các functions: `getAllSettings`, `updateSetting`, `updateMultipleSettings`, `changePassword`, `getDrugPresets`, `saveDrugPresets`
- [ ] **2.4** Tìm và refactor các file actions khác nếu có (medicines, prescriptions, etc.)
- [ ] **2.5** Test toàn bộ flow:
  - Login → Dashboard → Patient list → Patient detail → Kê đơn
  - Verify không có lỗi auth ở bất kỳ bước nào

### Files to Create/Modify

| File | Thao tác | Mục đích |
|------|----------|----------|
| `src/lib/supabase/auth.ts` | **Tạo mới** | Shared cached auth helper |
| `src/lib/supabase/middleware.ts` | **Tạo mới** | Middleware helper |
| `src/middleware.ts` | **Tạo mới** | Next.js middleware |
| `src/actions/patients.ts` | **Sửa** | Dùng `getAuthUser()` |
| `src/actions/settings.ts` | **Sửa** | Dùng `getAuthUser()` |
| `src/actions/prescriptions.ts` | **Sửa** (nếu có) | Dùng `getAuthUser()` |
| `src/actions/medicines.ts` | **Sửa** (nếu có) | Dùng `getAuthUser()` |

---

## Test Criteria

- [ ] `getUser()` chỉ gọi network **1 lần** per request (kiểm tra qua Supabase logs hoặc console.log)
- [ ] Tất cả pages hoạt động bình thường sau refactor
- [ ] Middleware redirect đúng khi chưa login
- [ ] Middleware không chặn static files (CSS, JS, images)
- [ ] `changePassword` vẫn hoạt động (function này cần gọi `signInWithPassword` riêng)

---

## ⚠️ Lưu ý quan trọng

1. **`changePassword()`** cần xử lý đặc biệt — hàm này cần `signInWithPassword()` nên không thể dùng chung supabase client từ `getAuthUser()`
2. **Write operations** (`addPatient`, `updatePatient`, `deletePatient`) vẫn nên verify auth qua `getUser()` (không dùng `getSession()`) để đảm bảo token valid
3. Khi refactor, giữ nguyên logic error handling hiện tại

---

Next Phase: → [Phase 03: Dashboard Layout Non-blocking](./phase-03-layout-optimization.md)
