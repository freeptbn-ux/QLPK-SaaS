# Phase 03: Next.js Architecture Refactor (Server Components + URL State)
Status: ✅ DONE
Dependencies: Phase 01 (RPCs), Phase 02 (Zod)
Priority: 🔴 HIGH

## Objective
Chuyển data fetching từ `useEffect` trong Client Components sang Server Components (SSR). Di chuyển pagination/search state từ `useState` sang URL `searchParams` để tận dụng App Router caching, sharing, và prefetching.

## Issues Addressed
- **Issue #2:** Client-Side Fetching via Server Actions (HIGH)
- **Issue #11:** Phantom State / Missing URL Params (MEDIUM)

## Root Cause Analysis

### Hiện tại (Anti-pattern):
```
User navigates → Page renders empty → useEffect fires → POST Server Action → 
Data returns → Re-render with data → User sees content (waterfall!)
```

### Mục tiêu (App Router pattern):
```
User navigates → Server Component fetches data → HTML with data sent → 
User sees content immediately (no waterfall!)
```

## Requirements
### Functional
- [ ] PatientList: Fetch data trong Server Component, truyền xuống Client
- [ ] PatientList: page/search/size state ở URL searchParams
- [ ] StatisticsClient: Fetch overview + filter data trong Server Component
- [ ] URL thay đổi khi paginate/search (shareable, back button works)

### Non-Functional
- [ ] TTFB giảm (server trả HTML có data sẵn)
- [ ] LCP cải thiện (không còn loading skeleton cho initial data)
- [ ] URL sharing hoạt động

## Implementation Steps

### A. Refactor PatientList

1. [ ] **Tạo `src/app/(dashboard)/patients/page.tsx`** - Server Component
   ```tsx
   import { getPatientsPaginated, searchPatients } from '@/actions/patients';
   import PatientListClient from '@/components/features/patients/PatientListClient';
   
   export default async function PatientsPage({
     searchParams,
   }: {
     searchParams: Promise<{ q?: string; page?: string; size?: string }>;
   }) {
     const params = await searchParams;
     const query = params.q || '';
     const page = parseInt(params.page || '1', 10);
     const pageSize = parseInt(params.size || '50', 10);
   
     const result = query
       ? await searchPatients(query, page, pageSize)
       : await getPatientsPaginated(page, pageSize);
   
     return (
       <PatientListClient
         initialData={result.data}
         totalCount={result.count || 0}
         currentPage={page}
         currentSize={pageSize}
         searchQuery={query}
       />
     );
   }
   ```

2. [ ] **Rename/Refactor `PatientList.tsx` → `PatientListClient.tsx`**
   - Remove `useEffect` + `fetchPatients` logic
   - Accept `initialData`, `totalCount`, `currentPage`, `currentSize`, `searchQuery` as props
   - Dùng `useRouter` + `useSearchParams` để navigate thay vì `useState`

3. [ ] **Cập nhật navigation logic** - Dùng URL params
   ```tsx
   import { useRouter, useSearchParams } from 'next/navigation';
   
   // Thay vì setPage(newPage):
   const handleChangePage = (newPage: number) => {
     const params = new URLSearchParams(searchParams.toString());
     params.set('page', String(newPage));
     router.push(`/patients?${params.toString()}`);
   };
   
   // Thay vì setSearchTerm(term):
   const handleSearch = (term: string) => {
     const params = new URLSearchParams();
     if (term) params.set('q', term);
     params.set('page', '1');
     router.push(`/patients?${params.toString()}`);
   };
   ```

4. [ ] **Debounce search** - Tránh quá nhiều navigations khi đang gõ
   - Dùng `useDebouncedCallback` hoặc implement `setTimeout` pattern
   - Cập nhật `PatientSearch.tsx` để submit qua URL thay vì callback

5. [ ] **Refresh sau mutation** - Dùng `router.refresh()` thay vì `fetchPatients()`
   - Sau add/edit/delete patient → `router.refresh()` để Server Component re-fetch

### B. Refactor Statistics

6. [ ] **Cập nhật `src/app/(dashboard)/statistics/page.tsx`** - Server Component
   ```tsx
   import { getDistinctMonthsYears, getOverviewStats, getStatsByGender, getStatsByLocation } from '@/actions/statistics';
   import StatisticsClient from '@/components/features/statistics/StatisticsClient';
   
   export default async function StatisticsPage() {
     const [availableMonths, overview, genderData, locationData] = await Promise.all([
       getDistinctMonthsYears(),
       getOverviewStats(),
       getStatsByGender(),
       getStatsByLocation(),
     ]);
   
     return (
       <StatisticsClient
         availableMonths={availableMonths}
         initialOverview={overview}
         initialGenderData={genderData}
         initialLocationData={locationData}
       />
     );
   }
   ```

7. [ ] **Refactor `StatisticsClient.tsx`**
   - Remove `getOverviewStats`, `getStatsByGender`, `getStatsByLocation` khỏi `useEffect`
   - Nhận `initialOverview`, `initialGenderData`, `initialLocationData` từ props
   - `useEffect` chỉ còn fetch time-range-specific data (visits, revenue, medicines)

8. [ ] **Xử lý filter state** - Giữ `useState` cho timeRange/selectedMonth (OK vì đây là UI state)
   - Chỉ move *initial data* fetch lên server
   - Filter-specific re-fetches vẫn dùng `useEffect` (acceptable tradeoff)

### C. General Cleanup

9. [ ] **Cập nhật `PatientSearch.tsx`** - Sync với URL
   - Đọc initial value từ `searchParams` thay vì empty string
   - Submit search → update URL

10. [ ] **Test browser back/forward navigation**
    - Verify pagination state preserved
    - Verify search term preserved
    - Verify URL shareable (copy-paste works)

## Files to Create/Modify
- `src/app/(dashboard)/patients/page.tsx` - **MODIFY** thành Server Component
- `src/components/features/patients/PatientList.tsx` - **MAJOR REFACTOR** → `PatientListClient.tsx`
- `src/components/features/patients/PatientSearch.tsx` - **MODIFY** URL-aware search
- `src/app/(dashboard)/statistics/page.tsx` - **MODIFY** thành Server Component
- `src/components/features/statistics/StatisticsClient.tsx` - **MODIFY** accept initial data

## Test Criteria
- [ ] `/patients` load không có loading skeleton (data trong HTML)
- [ ] `/patients?q=nguyen&page=2` hiển thị đúng data
- [ ] Back button giữ nguyên page/search state
- [ ] Copy URL → paste → hiển thị đúng page
- [ ] `/statistics` load overview stats ngay (không skeleton)
- [ ] Filter thay đổi (day/week/month) vẫn hoạt động

## Notes
- Next.js 16 `searchParams` là Promise → phải `await`
- `PatientFormDialog` + `MergePatientDialog` + `ConfirmDialog` vẫn là client-side (OK)
- Sau mutation (add/edit/delete), dùng `router.refresh()` để trigger Server Component re-fetch
- Statistics filter (timeRange) phụ thuộc user interaction → vẫn dùng `useEffect` cho phần này

---
Previous Phase: [phase-02-server-action-hardening.md](./phase-02-server-action-hardening.md)
Next Phase: [phase-04-frontend-performance.md](./phase-04-frontend-performance.md)
