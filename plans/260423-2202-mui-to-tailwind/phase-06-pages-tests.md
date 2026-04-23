# Phase 06: Pages, Error Boundaries & Tests Migration
Status: ✅ Completed
Dependencies: Phase 05a + 05b (All feature components migrated)

## Objective
Chuyển đổi các pages (route components), error boundaries, và cập nhật tất cả unit tests để tương thích với Tailwind components mới. Đảm bảo toàn bộ ứng dụng hoạt động end-to-end.

## Requirements
### Functional
- [x] Tất cả pages render đúng với Tailwind components
- [x] Error boundaries hoạt động
- [x] Loading states hoạt động
- [x] 404 page hoạt động

### Non-Functional
- [x] Tất cả unit tests pass
- [x] Không có MUI imports còn sót trong bất kỳ page nào
- [x] `npm run build` thành công

## Implementation Steps

### Pages Migration

#### 1. Landing Page
1. [x] Update `src/app/page.tsx`:
   - Check MUI usage và migrate
   - Thường là redirect page

#### 2. Login Page
2. [x] Rewrite `src/app/(auth)/login/page.tsx`:
   - **MUI removed**: `Box`, `Button`, `TextField`, `Typography`, `Paper`, `Alert`, `CircularProgress`
   - **Tailwind approach**: Login card với form inputs
   - **react-icons**: spinner animation cho loading

#### 3. Dashboard Home
3. [x] Update `src/app/(dashboard)/page.tsx`:
   - Check và update MUI usage

#### 4. Patients Page
4. [x] Update `src/app/(dashboard)/patients/page.tsx`:
   - Wrap PatientList component (đã migrate Phase 05a)

#### 5. Patient Detail Page
5. [x] Update `src/app/(dashboard)/patients/[id]/page.tsx`:
   - Check MUI usage trong page wrapper

#### 6. Prescribe Page
6. [x] Update `src/app/(dashboard)/patients/[id]/prescribe/page.tsx`:
   - Check MUI usage trong page wrapper

#### 7. Medicines Page
7. [x] Update `src/app/(dashboard)/medicines/page.tsx`:
   - Wrap MedicineList component

#### 8. Statistics Page
8. [x] Update `src/app/(dashboard)/statistics/page.tsx`:
   - Wrap StatisticsClient component

#### 9. Settings Page
9. [x] Update `src/app/(dashboard)/settings/page.tsx`:
   - Wrap SettingsForm component

#### 10. Dose Calculator Page
10. [x] Update `src/app/(dashboard)/dose-calculator/page.tsx`:
    - Wrap DoseCalculator component

### Error & Loading Pages

#### 11. Root Error Page
11. [x] Update `src/app/error.tsx`:
    - **MUI removed**: Bất kỳ MUI components nào
    - **Tailwind**: Error message + retry button

#### 12. Dashboard Error Page
12. [x] Update `src/app/(dashboard)/error.tsx`:
    - Tương tự root error

#### 13. Not Found Page
13. [x] Update `src/app/not-found.tsx`:
    - **MUI removed**: Check và migrate
    - **Tailwind**: 404 UI

#### 14. Loading Page
14. [x] Update `src/app/loading.tsx`:
    - **Tailwind**: Loading spinner / skeleton

### Test Migration

#### 15. Test Setup
15. [x] Rewrite `src/test/setup.ts`:
    - **Bỏ hoàn toàn** MUI mock (`vi.mock('@mui/material/styles')`)
    - Thay bằng mock cho ThemeContext mới (nếu cần)
    - Đảm bảo Tailwind classes render trong test environment

#### 16. DateInput Tests
16. [x] Update `src/components/ui/__tests__/DateInput.test.tsx`:
    - Cập nhật selectors cho DOM mới (không còn MUI component DOM)
    - Giữ nguyên test cases: nhập ngày, paste, keyboard navigation

#### 17. CountUp Tests
17. [x] Update `src/components/ui/__tests__/CountUp.test.tsx`:
    - Review và update nếu cần

#### 18. PatientFormDialog Tests
18. [x] Update `src/components/features/patients/__tests__/PatientFormDialog.test.tsx`:
    - Cập nhật selectors: MUI `TextField` → native `input`
    - Cập nhật dialog open/close assertions
    - react-hook-form integration tests giữ nguyên logic

#### 19. PrescriptionForm Tests
19. [x] Update `src/components/features/prescriptions/__tests__/PrescriptionForm.test.tsx`:
    - Cập nhật tương tự PatientFormDialog tests

#### 20. AgeGroupChart Tests
20. [x] Update `src/components/features/statistics/__tests__/AgeGroupChart.test.tsx`:
    - Cập nhật card wrapper selectors

#### 21. Age Utility Tests
21. [x] Review `src/lib/utils/__tests__/age.test.ts`:
    - Không nên có MUI dependency, chỉ review

#### 22. Patient Validation Tests
22. [x] Review `src/lib/validations/__tests__/patient.test.ts`:
    - Không nên có MUI dependency, chỉ review

## Files to Modify
| File | Complexity | Change Type | Status |
|------|-----------|-------------|--------|
| `src/app/page.tsx` | 🟢 Low | Review/Minor update | ✅ |
| `src/app/(auth)/login/page.tsx` | 🟡 Medium | Full rewrite | ✅ |
| `src/app/(dashboard)/page.tsx` | 🟢 Low | Review/Minor update | ✅ |
| `src/app/(dashboard)/patients/page.tsx` | 🟢 Low | Minor update | ✅ |
| `src/app/(dashboard)/patients/[id]/page.tsx` | 🟢 Low | Minor update | ✅ |
| `src/app/(dashboard)/patients/[id]/prescribe/page.tsx` | 🟢 Low | Minor update | ✅ |
| `src/app/(dashboard)/medicines/page.tsx` | 🟢 Low | Minor update | ✅ |
| `src/app/(dashboard)/statistics/page.tsx` | 🟢 Low | Minor update | ✅ |
| `src/app/(dashboard)/settings/page.tsx` | 🟢 Low | Minor update | ✅ |
| `src/app/(dashboard)/dose-calculator/page.tsx` | 🟢 Low | Minor update | ✅ |
| `src/app/error.tsx` | 🟢 Low | MUI removal | ✅ |
| `src/app/(dashboard)/error.tsx` | 🟢 Low | MUI removal | ✅ |
| `src/app/not-found.tsx` | 🟢 Low | MUI removal | ✅ |
| `src/app/loading.tsx` | 🟢 Low | Review | ✅ |
| `src/test/setup.ts` | 🟡 Medium | Remove MUI mocks | ✅ |
| `src/components/ui/__tests__/DateInput.test.tsx` | 🟡 Medium | Update selectors | ✅ |
| `src/components/ui/__tests__/CountUp.test.tsx` | 🟢 Low | Review | ✅ |
| `src/components/features/patients/__tests__/PatientFormDialog.test.tsx` | 🟡 Medium | Update selectors | ✅ |
| `src/components/features/prescriptions/__tests__/PrescriptionForm.test.tsx` | 🟡 Medium | Update selectors | ✅ |
| `src/components/features/statistics/__tests__/AgeGroupChart.test.tsx` | 🟢 Low | Update selectors | ✅ |

## Test Criteria
- [x] `npm run test` - tất cả tests pass
- [x] `npm run build` - build thành công
- [x] `npm run dev` - dev server chạy OK
- [x] Mọi page load không lỗi
- [x] Login flow hoạt động
- [x] Dashboard navigation hoạt động  
- [x] Error boundaries catch và display errors
- [x] 404 page hiển thị cho routes không tồn tại

## Notes
- **Login page** là page MUI-heavy duy nhất cần rewrite hoàn toàn. Các pages khác chủ yếu là wrapper components.
- **Test setup** cần xóa MUI mock vì không còn dùng `useTheme` từ MUI nữa.
- **Test selectors** sẽ thay đổi vì DOM structure khác: MUI renders nhiều wrapper divs, Tailwind components thường có DOM đơn giản hơn.
- Nên chạy `npm run test` sau mỗi test file update để đảm bảo không regression.

---
Previous Phase: [phase-05b-features-prescriptions-stats-settings.md](./phase-05b-features-prescriptions-stats-settings.md)
Next Phase: [phase-07-cleanup.md](./phase-07-cleanup.md)
