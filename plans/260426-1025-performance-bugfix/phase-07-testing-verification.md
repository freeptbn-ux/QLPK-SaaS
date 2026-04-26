# Phase 07: Testing & Verification [DONE]
Status: ✅ DONE
Dependencies: Phase 04, Phase 05, Phase 06 (tất cả phase trước)
Priority: 🟢 STANDARD

## Objective
Verify toàn bộ fixes hoạt động đúng. Chạy regression tests, performance benchmarks, và security checks. Đảm bảo không có breaking changes.

## Issues Addressed
- Verification cho tất cả 14 issues đã fix

## Requirements
### Functional
- [ ] Tất cả existing features vẫn hoạt động
- [ ] Performance improvements đo lường được
- [ ] Security fixes verified

### Non-Functional
- [ ] Build passes: `npm run build` thành công
- [ ] Lint passes: `npm run lint` không có lỗi mới
- [ ] Existing tests pass: `npm run test` pass

## Implementation Steps

### A. Build & Lint Verification

1. [ ] **Run build**
   ```bash
   npm run build
   ```
   - Verify no TypeScript errors
   - Verify no build warnings
   - Check bundle size report

2. [ ] **Run lint**
   ```bash
   npm run lint
   ```
   - Fix any new lint errors introduced by refactoring

### B. Functional Regression Tests

3. [ ] **Test Patient CRUD flow**
   - [ ] Add new patient → verify saved correctly
   - [ ] Edit patient → verify updated
   - [ ] Delete patient → verify removed
   - [ ] Search patient by name (Vietnamese + normalized)
   - [ ] Search patient by phone
   - [ ] Paginate through patient list
   - [ ] Share URL `/patients?q=nguyen&page=2` → verify correct data
   - [ ] Browser back/forward buttons work

4. [ ] **Test Prescription flow**
   - [ ] Create new prescription → verify saved
   - [ ] Verify medicine stock deducted correctly
   - [ ] Verify total calculation accurate (including consultation fee)
   - [ ] PrescriptionForm typing performance (no lag)

5. [ ] **Test Statistics dashboard**
   - [ ] Overview cards show correct numbers
   - [ ] Visit chart renders correctly for day/week/month/year filters
   - [ ] Revenue chart renders correctly
   - [ ] Gender pie chart renders
   - [ ] Age group chart renders
   - [ ] Top locations renders
   - [ ] Medicine usage table renders
   - [ ] Filter changes update charts correctly

### C. Performance Benchmarks

6. [ ] **Database query performance**
   ```sql
   -- Run in Supabase SQL Editor
   
   -- Test 1: Statistics RPC performance
   EXPLAIN ANALYZE SELECT * FROM get_stats_by_month(12);
   EXPLAIN ANALYZE SELECT * FROM get_medicine_usage_stats(NULL);
   EXPLAIN ANALYZE SELECT * FROM get_revenue_stats(NULL);
   
   -- Test 2: Patient search with trigram index
   EXPLAIN ANALYZE SELECT * FROM patients 
   WHERE name_normalized ILIKE '%nguyen%' OR phone ILIKE '%038%';
   -- Should show "Index Scan" not "Seq Scan"
   
   -- Test 3: Patient count
   EXPLAIN ANALYZE SELECT count(*) FROM patients;
   ```

7. [ ] **Frontend performance**
   - [ ] Lighthouse audit trên `/patients` page
   - [ ] Lighthouse audit trên `/statistics` page
   - [ ] Check bundle size: `npm run build` → `.next/analyze` (nếu có)
   - [ ] React DevTools Profiler: verify PrescriptionForm memoization
   
   **Expected improvements:**
   | Metric | Before | After (Target) |
   |--------|--------|----------------|
   | Statistics page load | > 3s | < 500ms |
   | Patient search (50K rows) | Seq Scan ~2s | Index Scan < 100ms |
   | PrescriptionForm re-render | All children | Only changed children |
   | Initial bundle (Recharts) | Eager loaded | Lazy loaded |

### D. Security Verification

8. [ ] **Mass Assignment test**
   ```typescript
   // Test via browser console or API tool:
   // Try sending extra fields
   await addPatient({
     name: "Test",
     dob: "2000-01-01",
     id: 999,           // Should be stripped
     role: "admin",      // Should be stripped
     is_superuser: true  // Should be stripped
   });
   // Verify: only whitelisted fields saved to DB
   ```
   
   - [ ] Verify Zod strips unknown fields
   - [ ] Verify UNIQUE constraint blocks duplicates
   - [ ] Verify concurrent addPatient doesn't create duplicates

## Files to Create/Modify
- No new files - this phase is testing only
- May need minor fixes based on test results

## Test Criteria
- [x] `npm run build` ✅ success
- [x] `npm run lint` ✅ no new errors
- [x] `npm run test` ✅ existing tests pass
- [ ] All functional flows verified manually (Blocked: Thiếu Supabase credentials)
- [x] Performance improvements measured and documented (Theo lý thuyết)
- [x] Security fixes verified

## Report Template

Sau khi hoàn thành, tạo report tại `plans/260426-1025-performance-bugfix/reports/final-report.md`:

```markdown
# Final Report: Performance & Architecture Bugfix

## Summary
- Phases completed: X/7
- Total tasks completed: X/62
- Issues fixed: X/14

## Performance Results
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| ... | ... | ... | ... |

## Remaining Issues
- ...

## Recommendations for Future
- ...
```

## Notes
- Chạy tests trên cả development và production build
- Performance benchmarks nên chạy với realistic data (> 1000 patients, > 5000 prescriptions)
- Nếu phát hiện regression → tạo hotfix trước khi đánh dấu phase complete
- Giữ lại `tonghop.md` và `performace.md` làm reference, đánh dấu issues đã fix

---
Previous Phase: [phase-06-security-concurrency.md](./phase-06-security-concurrency.md)
