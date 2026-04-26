# Logic & Algorithm Analysis Report

## 1. Summary
- The codebase is generally structured well, but there are several real state-consistency and data-integrity issues.
- The highest-risk problem is inventory control: prescription RPCs deduct stock without enforcing a lower bound, so stock can go negative.
- There are also UI data-flow bugs where client components keep stale copies of server props after refreshes or edits.
- A statistics chart is wired to an RPC contract that does not support the frontend's requested mode, which makes the age-group chart empty for most time ranges.

## 2. Critical Logic Errors
- Stock can go negative during prescription creation, append, and edit.
  - Root cause: the database RPCs subtract quantities directly and never check whether enough stock exists before the update. The frontend shows stock levels, but it does not enforce them at submission time either.
  - Impact: medicine inventory can become negative, which breaks stock reporting and allows prescriptions that exceed available supply.
  - Fix suggestion: enforce stock validation in the RPC itself before any deduction, and reject the transaction when requested quantity exceeds current stock.

  Example fix pattern:
  ```sql
  SELECT stock_quantity
  INTO v_stock
  FROM medicines
  WHERE id = v_item_medicine_id
  FOR UPDATE;

  IF v_stock < v_item_quantity THEN
    RAISE EXCEPTION 'Insufficient stock for medicine %', v_item_medicine_id;
  END IF;
  ```

- Patient detail data becomes stale after edits.
  - Root cause: [src/components/features/patients/PatientDetail.tsx](src/components/features/patients/PatientDetail.tsx) copies the `patient` prop into local state once and never syncs it again.
  - Impact: after a successful edit and `router.refresh()`, the UI can continue rendering the old patient snapshot, including diagnosis and prescription summary.
  - Fix suggestion: render directly from the prop, or sync local state with an effect when the prop changes.

- The age-group chart receives an unsupported filter mode.
  - Root cause: [src/components/features/statistics/StatisticsClient.tsx](src/components/features/statistics/StatisticsClient.tsx) passes `getPatientDobsByTime('all', '')` for week, month, and year views, but the RPC in [supabase/migrations/008_statistics_rpcs.sql](supabase/migrations/008_statistics_rpcs.sql) only handles `month` and `year` and otherwise returns no rows.
  - Impact: `AgeGroupChart` is empty for most time ranges, which makes the statistics page misleading.
  - Fix suggestion: either add an `all` branch to the RPC or call the RPC with a supported filter type for each view.

- Prescription edit state is reconstructed locally with placeholder detail IDs.
  - Root cause: [src/components/features/patients/PrescriptionHistory.tsx](src/components/features/patients/PrescriptionHistory.tsx) rebuilds `prescription_details` after update and assigns `id: 0` when a medicine was not already present in the original record.
  - Impact: duplicate React keys can appear, and the client-side representation can diverge from the persisted record after editing.
  - Fix suggestion: refetch the prescription history after a successful update or use the server response as the source of truth instead of synthesizing detail rows locally.

- Search input state can desynchronize from the active query.
  - Root cause: [src/components/features/patients/PatientSearch.tsx](src/components/features/patients/PatientSearch.tsx) initializes `searchTerm` from `initialValue` only once and never updates it when the prop changes.
  - Impact: navigating back, forward, or programmatically changing the query can leave the input showing an old value even though the list has changed.
  - Fix suggestion: add a syncing effect or make the input fully controlled by the parent query state.

## 3. Algorithmic Inefficiencies
- Duplicate patient fetch on the patient detail route.
  - Problem: [src/app/(dashboard)/patients/[id]/page.tsx](src/app/(dashboard)/patients/[id]/page.tsx) calls `getPatientById()` in both `generateMetadata()` and the page component.
  - Complexity analysis: this doubles the database work for every patient detail request, including the nested prescriptions query inside `getPatientById()`.
  - Optimization approach: use a lighter metadata-only query for `generateMetadata()`, or wrap the data fetch in a shared cache helper so the request is reused.

- Medicine autocomplete recreates its debounced fetch too often.
  - Problem: [src/components/features/prescriptions/MedicineAutocomplete.tsx](src/components/features/prescriptions/MedicineAutocomplete.tsx) rebuilds the debounced function whenever `excludeIds` changes, and `excludeIds` is passed as a new array from the parent on each render.
  - Complexity analysis: repeated recreation resets the debounce timer and can trigger redundant network requests while the user types.
  - Optimization approach: memoize the excluded IDs in the parent, keep the debounced function stable, and cancel pending work on unmount.

  Example fix pattern:
  ```tsx
  const excludeIds = useMemo(() => items.map((item) => item.medicine_id), [items]);

  useEffect(() => {
    return () => debouncedFetch.cancel();
  }, [debouncedFetch]);
  ```

## 4. Edge Case Issues
- Search terms with wildcard or filter metacharacters are not escaped.
  - Scenario: a user types `%`, `_`, commas, or other special characters into the patient search box.
  - Failure explanation: [src/actions/patients.ts](src/actions/patients.ts) interpolates raw input into a PostgREST `or()` string, so wildcard characters can broaden matches unexpectedly or break the filter expression.
  - Fix: escape LIKE wildcards and any query-string metacharacters before building the filter, or move search logic into a parameterized RPC.

- Statistics can silently degrade to zero values.
  - Scenario: one of the overview RPCs or count queries fails.
  - Failure explanation: [src/actions/statistics.ts](src/actions/statistics.ts) returns empty arrays or zero-like values on error without surfacing the failure to the caller.
  - Fix: propagate errors for critical dashboard data, or expose an explicit partial-failure state so the UI does not look like the clinic has no data.

- Empty or invalid client state is not revalidated after server refresh.
  - Scenario: a patient or prescription is edited in one dialog and the parent route refreshes.
  - Failure explanation: components that cache server props in local state do not resync, so the UI can keep showing old values until a hard navigation happens.
  - Fix: remove redundant local copies or add prop-to-state synchronization effects.

## 5. Code Improvement Suggestions
- Sync `PatientSearch` with the active query.
  ```tsx
  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);
  ```

- Avoid stale patient snapshots in `PatientDetail`.
  ```tsx
  export default function PatientDetail({ patient }: PatientDetailProps) {
    const currentPatient = patient;
    // render directly from props, or sync local state if local edits are needed
  }
  ```

- Make the statistics age query match the RPC contract.
  ```tsx
  const dobFilterType = timeRange === 'day' ? 'month' : 'year';
  const dobs = await getPatientDobsByTime(dobFilterType, timeRange === 'day' ? selectedMonth : currentYear);
  ```

- Enforce stock checks in the prescription RPC before subtracting inventory.
  ```sql
  IF v_stock < v_item_quantity THEN
    RAISE EXCEPTION 'Insufficient stock';
  END IF;
  ```

## 6. Risk Assessment
- High
  - Negative inventory from prescription RPCs.
  - Empty age-group statistics for week/month/year views.
  - Stale patient detail state after refresh or edit.
- Medium
  - Prescription edit state reconstructed with placeholder IDs.
  - Duplicate database fetch on the patient detail route.
  - Debounced medicine search recreated too frequently.
- Low
  - Search input not resynced when its initial query prop changes.
  - Dashboard failures being collapsed into zero-like values.

## 7. Final Recommendations
- Move stock enforcement into the database RPCs so inventory invariants are guaranteed server-side.
- Remove or synchronize client-side copies of server data that can go stale after refreshes.
- Align the statistics frontend with the RPC contract, especially for DOB aggregation.
- Add targeted tests for search escaping, stock underflow, and post-edit UI refresh behavior.