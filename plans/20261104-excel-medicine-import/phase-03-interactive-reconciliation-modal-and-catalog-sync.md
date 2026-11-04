# Phase 03: Interactive Reconciliation Modal & Catalog Sync

**Status:** ✅ Completed  
**Dependencies:** Phase 01 (Backend Actions & Alias Storage), Phase 02 (Spreadsheet Parser & Pharma Matcher), `MedicineList.tsx`, `useMedicineCatalog.ts`.

---

## 1. Objective

Integrate the complete user experience by adding a prominent "Nhập thuốc" button in the Medicine Inventory view (`/medicines`), providing an accessible drag-and-drop file upload dialog, rendering an interactive 3-tier reconciliation table with instant manual search overrides, executing the batch update, persisting newly confirmed aliases, and invalidating the client catalog cache so the prescription form reflects updated stock levels immediately.

---

## 2. Scope

- **In Scope:**
  - Add the "Nhập thuốc" (Import Medicines) action button to the toolbar in `src/components/features/medicines/MedicineList.tsx`.
  - Create the file upload dropzone dialog supporting drag-and-drop or file browsing for `.xlsx`, `.xls`, and `.csv` files.
  - Render an interactive Reconciliation Review Modal:
    - Summary status pill counters: Total items, Confident matches (🟢), Suggested matches (🟡), Unmatched (🔴).
    - Data review table showing:
      - Raw Name from Excel (and Brand / Spec).
      - Target Clinic Medicine selector / display.
      - Current Physical Stock.
      - Additive Quantity (`+SL`).
      - Projected Resulting Stock (`=Tồn mới`).
      - Status Badge.
      - Action controls (Dropdown selector to change matched medicine, or checkbox/toggle to "Tạo thuốc mới vào kho").
  - Support manual search override: when a user clicks on a suggested or unmatched row, open an instant in-memory search dropdown (powered by existing `useMedicineCatalog` data) to select any medicine from the clinic catalog.
  - Implement the commit pipeline:
    - User clicks "Xác nhận nhập kho" (Confirm Import).
    - Calls Phase 01 batch stock ingestion action with all confirmed item adjustments.
    - Saves newly user-confirmed mappings to the clinic's `medicine_aliases` table.
    - Triggers `invalidateMedicineCatalog()` to bust the client-side catalog cache.
    - Refreshes the `MedicineList` view and displays a toast notification summarizing total items and stock updated.
  - Create a single comprehensive file-based UI test verifying file selection, table rendering, manual match reassignment, toggle for new medicine creation, batch submission, and cache invalidation invocation.

- **Out of Scope:**
  - Changes to prescription creation UI or patient consultation screens (already integrated in 20261104 feature).
  - Editing medicine prices or retail selling rules during the import process.

---

## 3. Requirements

### Functional Requirements
- **Toolbar Action Button:**
  - Place a secondary or primary button labeled "Nhập thuốc" with an Excel / upload icon next to "Thêm thuốc" in `MedicineList.tsx`.
- **Upload Step:**
  - Drag-and-drop zone with clear instructions and format restrictions (`.xlsx`, `.xls`, `.csv`).
  - Immediate visual feedback on file parse failure or missing critical columns (`Tên thuốc` or `Số lượng`), displaying human-friendly error messages without crashing.
- **Interactive Review Table:**
  - Clearly distinguish status tiers:
    - 🟢 Confident matches: Auto-checked and pre-selected.
    - 🟡 Suggested matches: Pre-selected with top candidate, highlighted with a warning badge prompting user verification.
    - 🔴 Unmatched: Highlighted with an action prompt (either pick an existing medicine from dropdown or enable "Tạo thuốc mới").
  - Stock Diff Visualization: Clearly display `[Tồn hiện tại] + [SL nhập] = [Tồn sau nhập]`.
  - Filter pills to view "Tất cả" (All), "Cần kiểm tra" (Needs Review), or "Chưa khớp" (Unmatched).
- **Manual Match Override:**
  - Provide an inline search autocomplete to quickly search the clinic's active catalog and assign a different medicine to any row.
  - When a user manually selects a medicine for a raw row, mark that pairing as a candidate to be remembered in `medicine_aliases`.
- **New Medicine Creation Option:**
  - For unmatched items, allowing the user to check "Tạo thuốc mới" pre-populates medicine name, packaging spec, brand, and unit price (if present in the spreadsheet) with initial stock set to the imported quantity.
- **Batch Execution & State Synchronization:**
  - Disable submit button and display a loading state ("Đang cập nhật kho...") during execution.
  - Execute database update and alias upsert.
  - Call `invalidateMedicineCatalog()` upon success.
  - Automatically close modal and re-render the updated medicine list.

### Non-Functional Requirements
- **Usability & Accessibility:** Full keyboard navigation support (Enter / Esc to close, Tab traversal), responsive layout suitable for desktop and tablet screens.
- **Theme Consistency:** Support both light and dark themes matching the existing Tailwind CSS 4 aesthetic in QLPK-SaaS.
- **Defensive Error Handling:** If the batch update action fails, display an explanatory alert and keep the reconciliation modal open so the user doesn't lose their manual mapping work.

---

## 4. Constraints

- Must seamlessly cooperate with the client-side cache engine implemented in `src/hooks/useMedicineCatalog.ts` without introducing cache desynchronization.
- Must not block the UI thread during file parsing or table rendering.
- Must adhere to multi-tenant isolation rules; only catalog medicines belonging to the user's active clinic may appear in search dropdowns.

---

## 5. Dependencies

- `src/components/features/medicines/MedicineList.tsx`
- `src/hooks/useMedicineCatalog.ts` (`useMedicineCatalog`, `invalidateMedicineCatalog`)
- Phase 01 Server Actions (`importMedicineStockBatch`, `saveMedicineAliases`)
- Phase 02 Parser & Matcher (`parseSpreadsheet`, `classifyMedicineRows`)
- Vitest and React Testing Library (`@testing-library/react`, `@testing-library/user-event`)

---

## 6. Acceptance Criteria

1. **Button Presence:** The "Nhập thuốc" button renders cleanly on `/medicines` and opens the import modal on click.
2. **File Processing:** Uploading `Danh_sach_thuoc.xlsx` instantly displays the reconciliation table populated with all 10 rows.
3. **Status Classification Display:** Rows are correctly tagged with 🟢 Confident, 🟡 Suggested, or 🔴 Unmatched badges.
4. **Manual Reassignment:** User can click a row to search and reassign it to an alternate medicine in the catalog.
5. **Stock Calculation Accuracy:** Displays accurate old stock, imported quantity, and calculated new stock for every row.
6. **Execution & Cache Invalidation:** Submitting the review executes the batch action, persists confirmed aliases, calls `invalidateMedicineCatalog()`, closes the modal, and shows a success toast.
7. **All criteria validated by test suite:** The single comprehensive file-based test passes 100% of user flow assertions.

---

## 7. Comprehensive File-Based Test Specification

**Test File:** `tests/phase-03-medicine-import-ui.test.tsx`

The test suite must verify the entire user interaction cycle from file upload to inventory update:
1. **Modal Trigger Test:** Renders `MedicineList` and verifies clicking "Nhập thuốc" opens the import dialog.
2. **Spreadsheet Ingestion & Rendering Test:** Simulates dropping an Excel file containing mixed confident, suggested, and unmatched rows; asserts that table rows, stock quantities, and status badges render accurately.
3. **Manual Selection Override Test:** Simulates opening the autocomplete dropdown on a suggested row, typing to search an alternate catalog medicine, and selecting it; verifies that target medicine ID and resulting stock update accordingly.
4. **Unmatched Item "Create New Medicine" Test:** Toggles the "Tạo thuốc mới" checkbox on an unmatched row and verifies it prepares new medicine payload data with spreadsheet attributes.
5. **Batch Submission Test:** Clicks "Xác nhận nhập kho" and verifies that:
   - `importMedicineStockBatch` is invoked with correct medicine IDs, quantities, and new medicine objects.
   - `saveMedicineAliases` is invoked with all user-confirmed alias pairs.
   - `invalidateMedicineCatalog` is called.
   - Success toast appears and the modal closes cleanly.
6. **Error Resilience Test:** Simulates a server failure during batch submission and verifies an error message appears while keeping user mapping choices intact in the dialog.

