# Phase 07: Cleanup & Final Verification
Status: ✅ Completed
Dependencies: Phase 06 (All components, pages, tests migrated)

## Objective
Gỡ bỏ hoàn toàn MUI + Emotion dependencies, clean up unused files, verify build, và chạy full test suite. Đây là phase cuối cùng, đảm bảo project "sạch" 100%.

## Requirements
### Functional
- [x] Toàn bộ ứng dụng hoạt động không MUI
- [x] Không còn import nào từ `@mui/*` hoặc `@emotion/*`
- [x] Build size giảm đáng kể

### Non-Functional
- [x] `npm run build` thành công
- [x] `npm run test` pass tất cả
- [x] `npm run lint` pass
- [x] Bundle size report

## Implementation Steps

### 1. Verify No MUI Imports Remaining
1. [ ] Chạy grep toàn project:
   ```bash
   grep -r "@mui" src/ --include="*.tsx" --include="*.ts"
   grep -r "@emotion" src/ --include="*.tsx" --include="*.ts"
   ```
   - Nếu tìm thấy → fix ngay
   - Kiểm tra cả file test, utils, types

### 2. Uninstall MUI + Emotion Packages
2. [ ] Gỡ bỏ MUI packages:
   ```bash
   npm uninstall @mui/material @mui/icons-material @mui/material-nextjs @emotion/cache @emotion/react @emotion/styled
   ```

### 3. Clean Up Deleted/Unused Files
3. [ ] Xóa files không còn dùng:
   - `src/theme/theme.ts` (nếu chưa xóa ở Phase 02)
   - `src/app/page.module.css` (nếu không dùng)
   - Bất kỳ file nào chỉ chứa MUI re-exports

### 4. Clean Up globals.css
4. [ ] Xóa `@layer mui;` khỏi `src/app/globals.css`:
   - Dòng này chỉ cần cho giai đoạn chuyển tiếp MUI + Tailwind
   - Sau khi gỡ MUI, không còn cần nữa

### 5. Update package.json Scripts
5. [ ] Review `package.json`:
   - Kiểm tra scripts không reference MUI
   - Đảm bảo `devDependencies` sạch

### 6. Full Build Verification
6. [ ] Chạy full build:
   ```bash
   npm run build
   ```
   - Fix bất kỳ TypeScript errors nào
   - Fix bất kỳ build warnings nào

### 7. Full Test Suite
7. [ ] Chạy full tests:
   ```bash
   npm run test
   ```
   - Tất cả tests phải pass
   - Fix failures nếu có

### 8. Lint Check
8. [ ] Chạy linter:
   ```bash
   npm run lint
   ```
   - Fix lint warnings/errors

### 9. Bundle Size Comparison
9. [ ] So sánh bundle size trước và sau:
   - Chạy `npx next build` và ghi nhận page sizes
   - So sánh với build trước migration
   - Expected: giảm ~200-400KB (MUI + Emotion bundle)

### 10. Visual Regression Check
10. [ ] Kiểm tra thủ công tất cả các trang:
    - [ ] Login page (light + dark)
    - [ ] Dashboard home
    - [ ] Patient list + search + filter
    - [ ] Patient detail + prescription history
    - [ ] Create prescription (autocomplete, table, payment)
    - [ ] Medicine list + search + low stock filter
    - [ ] Medicine form (add/edit)
    - [ ] Statistics dashboard (all charts)
    - [ ] Settings page (all sections)
    - [ ] Dose calculator
    - [ ] 404 page
    - [ ] Error page
    - [ ] Mobile responsive (sidebar, bottom nav)
    - [ ] Dark mode toggle

### 11. Performance Check
11. [ ] Chạy Lighthouse audit:
    - Performance score
    - First Contentful Paint
    - Largest Contentful Paint
    - Total Blocking Time

### 12. Clean Up node_modules
12. [ ] Sau khi uninstall, clean:
    ```bash
    rm -rf node_modules package-lock.json
    npm install
    ```
    - Đảm bảo fresh install hoạt động

## Files to Modify
| File | Action |
|------|--------|
| `package.json` | Remove MUI/Emotion dependencies |
| `src/app/globals.css` | Remove `@layer mui;` |
| `src/theme/theme.ts` | DELETE (nếu chưa xóa) |
| `src/app/page.module.css` | DELETE (nếu unused) |

## Verification Checklist

### Build & Test
- [x] `npm run build` → SUCCESS
- [x] `npm run test` → ALL PASS
- [x] `npm run lint` → CLEAN
- [x] `npm run dev` → NO ERRORS

### Grep Verification
- [x] `grep -r "@mui" src/` → NO RESULTS
- [x] `grep -r "@emotion" src/` → NO RESULTS
- [x] `grep -r "from '@mui" src/` → NO RESULTS

### Visual Verification
- [ ] Light mode: all pages look correct
- [ ] Dark mode: all pages look correct
- [ ] Mobile: responsive layout works
- [ ] Desktop: sidebar + content layout works
- [ ] Forms: validation errors display correctly
- [ ] Dialogs: open, close, submit
- [ ] Charts: render with data
- [ ] Tables: hover, sort, actions

### Performance
- [ ] Bundle size: _______ KB (trước: _______ KB)
- [ ] Lighthouse Performance: _______
- [ ] FCP: _______ ms
- [ ] LCP: _______ ms

## Test Criteria
- [ ] ZERO imports from `@mui/*` or `@emotion/*`
- [ ] Build thành công không warnings
- [ ] Tất cả tests pass
- [ ] Bundle size giảm >= 150KB
- [ ] Lighthouse Performance >= 90

## Notes
- **Đây là phase CUỐI CÙNG**. Sau phase này, project hoàn toàn chạy trên Tailwind CSS.
- **Clean install** (`rm -rf node_modules && npm install`) rất quan trọng để verify không có hidden dependency.
- **Bundle size** nên giảm đáng kể vì MUI core (~300KB minified) + Emotion runtime bị loại bỏ.
- Nên tạo git tag/commit rõ ràng: `feat: complete MUI to Tailwind CSS migration`.

## Final Report Template

```
📊 MIGRATION REPORT
===================

📦 Dependencies Removed: 6 packages
📁 Files Modified: XX files
🔄 Components Migrated: XX components

📏 Bundle Size:
   Before: XXX KB
   After:  XXX KB
   Saved:  XXX KB (XX%)

✅ Tests: XX/XX passed
✅ Build: Success
✅ Lint: Clean

🎉 Migration Complete!
```

---
Previous Phase: [phase-06-pages-tests.md](./phase-06-pages-tests.md)
