# Phase 02: Implement Client-Side Autocomplete
Status: ✅ Completed
Dependencies: Phase 01

## Objective
Refactor the `MedicineAutocomplete.tsx` component to load all medicines once in the background, remove debounce, and perform instant client-side matching.

## Requirements
### Functional
- [x] Import `getMedicinesForSearch` from `@/actions/medicines` and `removeDiacritics` from `@/lib/utils/normalize`.
- [x] Load the full list of medicines in a single `useEffect` on component mount (or when the input is first focused) and store it in a local `allMedicines` ref or state.
- [x] Remove `lodash/debounce` dependency and the debounced search function entirely.
- [x] Implement synchronous client-side filtering on input change:
  - Filter using diacritic-insensitive matching (convert both query and medicine names using `removeDiacritics` and compare).
  - Exclude items that are already in `excludeIds` prop.
  - Limit the displayed results in the dropdown to a maximum of 20 elements to keep UI render extremely fast.
- [x] Retain all existing features:
  - Loading state indicator for the initial load.
  - Dropdown opening/closing behavior on focus/blur.
  - Keyboard accessibility (ArrowUp/Down, Enter, Escape, Tab).
  - Warning/out-of-stock highlights and disabled-click toast alerts.

### Non-Functional
- [x] Performance: Search query updates should execute in 0ms without server-action round trips.
- [x] UX: Eliminating any typing delay, layout shifts, or network lag when adding, correcting, or deleting text.

## Implementation Steps
1. [x] Update imports in `src/components/features/prescriptions/MedicineAutocomplete.tsx`.
2. [x] Fetch and store the complete list of medicines on component mount.
3. [x] Replace the debounced async query logic with a direct local synchronous filter.
4. [x] Standardize the character-normalization search logic to handle Vietnamese tone accents flawlessly.

## Files to Create/Modify
- `src/components/features/prescriptions/MedicineAutocomplete.tsx` - Rewrite the autocomplete matching engine from server-querying to local-filtering.

## Test Criteria
- [x] Inputting text should instantly filter the dropdown list with 0ms delay.
- [x] Clearing or backspacing the text should update the results instantly without showing old/stale dropdown options.
- [x] Navigating with ArrowUp/Down and selecting via Enter continues to work perfectly.

---
Next Phase: [Phase 03: Unit Testing & Verification](file:///home/skul9x/Desktop/Test_code/QLPK-SaaS-main/plans/260601-1048-client-side-medicine-search/phase-03-testing.md)
