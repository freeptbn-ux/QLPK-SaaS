# Phase 04: Frontend Performance (Memoization + Dynamic Import)
Status: ✅ DONE
Dependencies: Phase 03 (Architecture phải refactor xong)
Priority: 🟡 MEDIUM

## Objective
Tối ưu re-rendering trong PrescriptionForm bằng `useMemo`/`useCallback`/`React.memo`. Lazy load Recharts bằng `next/dynamic`. Kiểm tra và tối ưu Lodash imports.

## Issues Addressed
- **Issue #10:** Unmemoized form computations (LOW)
- **Issue #12:** Bundle bloat - Recharts eager load (LOW)
- **Issue #14:** Lodash full bundle (LOW)

## Root Cause Analysis

### PrescriptionForm re-rendering:
```
User types in "notes" textarea
→ setNotes() triggers re-render
→ Entire form re-renders
→ calculateSubtotal() re-runs (unnecessary)
→ All PrescriptionItemRow re-render (unnecessary)
→ MedicineAutocomplete re-renders (unnecessary)
```

### Recharts eager loading:
```
StatisticsClient.tsx imports VisitChart, RevenueChart, etc. at top level
→ Recharts (~200kb) bundled into main chunk
→ Blocks initial page load even before user scrolls to charts
```

## Requirements
### Functional
- [ ] PrescriptionForm: `subtotal` computed chỉ khi `items` thay đổi
- [ ] PrescriptionItemRow: không re-render khi typing notes/diagnosis
- [ ] Charts: lazy loaded, không block initial paint
- [ ] Lodash: tree-shakeable imports

### Non-Functional
- [ ] Bundle size giảm ≥ 100kb cho initial load
- [ ] Form input lag giảm đáng kể (typing feels instant)

## Implementation Steps

### A. PrescriptionForm Optimization

1. [ ] **Memoize `subtotal` computation**
   ```tsx
   // BEFORE:
   const calculateSubtotal = () => {
     return items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
   };
   const subtotal = calculateSubtotal(); // Runs EVERY render
   
   // AFTER:
   const subtotal = useMemo(() => {
     return items.reduce((sum, item) => sum + Math.round(item.quantity * item.unit_price), 0);
   }, [items]);
   const total = subtotal + consultationFee;
   ```

2. [ ] **Wrap `handleUpdateItem` và `handleRemoveItem` trong `useCallback`**
   ```tsx
   const handleUpdateItem = useCallback((index: number, updates: Partial<PrescriptionItem>) => {
     setItems(prev => {
       const newItems = [...prev];
       newItems[index] = { ...newItems[index], ...updates };
       return newItems;
     });
   }, []);
   
   const handleRemoveItem = useCallback((index: number) => {
     setItems(prev => prev.filter((_, i) => i !== index));
   }, []);
   ```

3. [ ] **Wrap `PrescriptionItemRow` trong `React.memo`**
   ```tsx
   // src/components/features/prescriptions/PrescriptionItemRow.tsx
   const PrescriptionItemRow = React.memo(function PrescriptionItemRow({ 
     item, index, onUpdate, onRemove 
   }: Props) {
     // ... existing code
   });
   export default PrescriptionItemRow;
   ```

4. [ ] **Wrap `MedicineAutocomplete` trong `React.memo`**
   ```tsx
   const MedicineAutocomplete = React.memo(function MedicineAutocomplete({
     onSelect, excludeIds
   }: Props) {
     // ... existing code
   });
   export default MedicineAutocomplete;
   ```

### B. Dynamic Import for Charts

5. [ ] **Lazy load chart components trong `StatisticsClient.tsx`**
   ```tsx
   import dynamic from 'next/dynamic';
   
   const VisitChart = dynamic(
     () => import('@/components/features/statistics/VisitChart'),
     { 
       ssr: false,
       loading: () => <div className="h-64 w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl" />
     }
   );
   
   const RevenueChart = dynamic(
     () => import('@/components/features/statistics/RevenueChart'),
     { 
       ssr: false,
       loading: () => <div className="h-64 w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl" />
     }
   );
   
   const GenderPieChart = dynamic(
     () => import('@/components/features/statistics/GenderPieChart'),
     { ssr: false, loading: () => <ChartSkeleton /> }
   );
   
   const AgeGroupChart = dynamic(
     () => import('@/components/features/statistics/AgeGroupChart'),
     { ssr: false, loading: () => <ChartSkeleton /> }
   );
   ```

6. [ ] **Tạo `ChartSkeleton` component** (reusable loading placeholder)
   ```tsx
   function ChartSkeleton() {
     return (
       <div className="h-64 w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl" />
     );
   }
   ```

### C. Lodash Optimization

7. [ ] **Audit Lodash imports** - Tìm tất cả import lodash trong codebase
   ```bash
   grep -r "import.*lodash" src/
   ```

8. [ ] **Chuyển sang specific imports hoặc `lodash-es`**
   ```typescript
   // BEFORE (bad):
   import { debounce } from 'lodash';
   
   // AFTER (good - tree-shakeable):
   import debounce from 'lodash/debounce';
   ```
   Hoặc thay thế hoàn toàn bằng native JS nếu chỉ dùng ít functions.

## Files to Create/Modify
- `src/components/features/prescriptions/PrescriptionForm.tsx` - useMemo/useCallback
- `src/components/features/prescriptions/PrescriptionItemRow.tsx` - React.memo
- `src/components/features/prescriptions/MedicineAutocomplete.tsx` - React.memo
- `src/components/features/statistics/StatisticsClient.tsx` - next/dynamic imports
- Any files importing lodash - Specific imports

## Test Criteria
- [ ] Typing in "notes" textarea → PrescriptionItemRow does NOT re-render (verify with React DevTools Profiler)
- [ ] `subtotal` only recalculates when `items` array changes
- [ ] Statistics page: Charts load lazily (visible loading skeleton)
- [ ] Bundle analysis: Recharts not in main chunk
- [ ] No lodash full bundle in client bundle

## Notes
- `React.memo` chỉ hiệu quả khi props sử dụng primitive values hoặc stable references
- `handleUpdateItem` và `handleRemoveItem` PHẢI dùng `useCallback` để `React.memo` trên child có tác dụng
- Recharts cần DOM measurements nên `ssr: false` là cần thiết
- `handleAddMedicine` cũng nên wrap `useCallback`

---
Previous Phase: [phase-03-nextjs-architecture.md](./phase-03-nextjs-architecture.md)
Next Phase: [phase-05-data-fetching-optimization.md](./phase-05-data-fetching-optimization.md)
