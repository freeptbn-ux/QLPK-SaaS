# Phase 03: Dashboard Layout Non-blocking

Status: ✅ Completed
Dependencies: Phase 02 (cần middleware + auth helper)  
Effort: ~30 phút  
Fixes: 🔴 Dashboard Layout block — `getAllSettings()` chặn render toàn bộ trang

---

## Objective

Loại bỏ `getAllSettings()` blocking trong Dashboard Layout để tất cả pages con (bao gồm `/patients/[id]`) không phải chờ settings load xong mới bắt đầu render.

---

## Vấn đề hiện tại

File `src/app/(dashboard)/layout.tsx`:
```tsx
export default async function DashboardLayout({ children }) {
  const settings = await getAllSettings()  // ← BLOCK: ~50-150ms
  return (
    <SettingsProvider initialSettings={settings}>
      <DashboardShell>{children}</DashboardShell>
    </SettingsProvider>
  )
}
```

**Hệ quả**: Mọi page trong dashboard phải đợi `getAllSettings()` hoàn tất (~50-150ms) trước khi bắt đầu render. Overhead này cộng dồn vào **mỗi lần navigation**.

---

## Phương án đề xuất: `unstable_cache` + Revalidate Timer

### Lý do chọn

Settings hiếm khi thay đổi (chỉ khi admin vào `/settings` chỉnh sửa). Cache với thời gian sống 5 phút là hợp lý:
- **Lần đầu**: Vẫn phải fetch từ DB (~50ms)
- **Các lần sau** (trong 5 phút): Trả về từ cache (~0ms)
- **Khi settings thay đổi**: `revalidatePath('/', 'layout')` đã có sẵn trong `updateSetting()` → cache tự invalidate

### Implementation Steps

- [ ] **1.1** Tạo hàm `getCachedSettings()` trong `src/actions/settings.ts`:
  - Dùng `unstable_cache` (hoặc Next.js `cache` nếu phù hợp hơn)
  - Tag: `'settings'`
  - Revalidate: 300 giây (5 phút)
- [ ] **1.2** Cập nhật `src/app/(dashboard)/layout.tsx`:
  - Thay `getAllSettings()` bằng `getCachedSettings()`
- [ ] **1.3** Cập nhật `updateSetting()` và `updateMultipleSettings()`:
  - Thêm `revalidateTag('settings')` để invalidate cache khi settings thay đổi
  - Giữ nguyên `revalidatePath('/', 'layout')` hiện tại
- [ ] **1.4** Test:
  - Load dashboard page → settings hiển thị đúng
  - Vào `/settings` → thay đổi 1 setting → verify settings cập nhật
  - Load lại page → lần 2 phải nhanh hơn lần 1 (cache hit)

---

## Files to Modify

| File | Thao tác | Chi tiết |
|------|----------|----------|
| `src/actions/settings.ts` | **Sửa** | Thêm `getCachedSettings()`, thêm `revalidateTag` |
| `src/app/(dashboard)/layout.tsx` | **Sửa** | Dùng `getCachedSettings()` |

---

## Code Sketch

### `src/actions/settings.ts` — Thêm cached version:
```tsx
import { unstable_cache } from 'next/cache';

// Hàm gốc giữ nguyên cho các chỗ cần data real-time
export async function getAllSettings() { ... }

// Cached version cho layout
export const getCachedSettings = unstable_cache(
  async () => {
    // Gọi hàm gốc nhưng kết quả được cache
    return getAllSettings();
  },
  ['dashboard-settings'],
  { revalidate: 300, tags: ['settings'] }
);
```

### `src/actions/settings.ts` — Thêm revalidateTag:
```tsx
import { revalidateTag } from 'next/cache';

export async function updateSetting(key: string, value: string) {
  // ... logic hiện tại ...
  revalidatePath('/', 'layout');
  revalidateTag('settings');  // ← Thêm dòng này
}
```

### `src/app/(dashboard)/layout.tsx`:
```tsx
import { getCachedSettings } from '@/actions/settings';

export default async function DashboardLayout({ children }) {
  const settings = await getCachedSettings();  // ← Cache hit ~0ms
  return (
    <SettingsProvider initialSettings={settings}>
      <DashboardShell>{children}</DashboardShell>
    </SettingsProvider>
  );
}
```

---

## Test Criteria

- [ ] Dashboard pages load nhanh hơn (đặc biệt lần 2 trở đi)
- [ ] Settings hiển thị đúng trên mọi page
- [ ] Thay đổi settings trong `/settings` → cập nhật đúng trên dashboard
- [ ] Không break bất kỳ tính năng nào sử dụng settings (consultation_fee, clinic_name, etc.)

---

## Notes

- `unstable_cache` là API của Next.js, mặc dù tên có "unstable" nhưng đã ổn định trong production
- Nếu Next.js version không hỗ trợ `unstable_cache`, fallback sang `cache()` + manual timer
- Settings cache sẽ tự invalidate khi gọi `revalidateTag('settings')`

---

Next Phase: → [Phase 04: Streaming với Suspense](./phase-04-streaming-suspense.md)
