# Phase 02: Spreadsheet Parser & Multi-Layer Pharma Matching Engine

**Status:** ✅ Completed  
**Dependencies:** Phase 01 (`medicine_aliases` type contract), `useMedicineCatalog` data structure.

---

## 1. Objective

Build a zero-latency client-side spreadsheet parser and multi-layer pharmaceutical normalization and fuzzy matching engine that extracts raw medicine lines from `.xlsx` / `.xls` / `.csv` files and classifies each row into high-confidence matches, suggested matches, or unmatched items against the clinic's active catalog and persistent alias dictionary.

---

## 2. Scope

- **In Scope:**
  - Implement a spreadsheet reader capable of parsing `.xlsx`, `.xls`, and `.csv` files in the browser environment.
  - Automatically identify standard Vietnamese medicine inventory column headers (`Tên thuốc`, `Số lượng`, `Quy cách`, `Thương hiệu`, `Giá`) regardless of subtle naming variations or leading/trailing whitespace.
  - Develop a pharmaceutical normalization utility that strips diacritics, standardizes punctuation/casing, removes pharmaceutical stop-words (`thuốc`, `thuốc xịt mũi`, `siro`, `dạng ống`, `hộp`, `chai`, `lọ`, `vỉ`), while strictly isolating and preserving numerical dosage and volume tokens (`325`, `250mg`, `500mg`, `60ml`, `15ml`, `5ml`).
  - Develop a 4-tier matching engine:
    - **Tier 1 (Exact Match):** Case-insensitive string equality with existing catalog names.
    - **Tier 2 (Alias Memory Match):** Matching raw incoming supplier names against the clinic's persisted `medicine_aliases` dictionary.
    - **Tier 3 (Pharma Normalized Match):** Token set overlap comparing stripped medicine base names while enforcing identical dosage tokens.
    - **Tier 4 (Fuzzy String Similarity):** Calculating Trigram or edit-distance similarity to detect minor typos and spelling variations (e.g., `Augxicine` vs `Augixine`, `Oran-C` vs `Oran C`).
  - Classify parsed rows into 3 distinct status tiers:
    - 🟢 **Confident Match:** Confident single match (Tier 1, Tier 2, or Tier 3/4 score $\ge 0.85$).
    - 🟡 **Suggested Match:** Close candidates found (Score between $0.50$ and $0.84$, or multiple ambiguous candidates) requiring human confirmation.
    - 🔴 **Unmatched:** No confident candidate found (Score $< 0.50$).
  - Create a comprehensive file-based test verifying file parsing, header detection, normalization rules, dosage protection, and 100% correct classification of real-world supplier items from `Danh_sach_thuoc.xlsx`.

- **Out of Scope:**
  - Persisting data to Supabase database (handled in Phase 01 and executed in Phase 03).
  - Rendering UI tables and modal components (handled in Phase 03).

---

## 3. Requirements

### Functional Requirements
- **Flexible Spreadsheet Parsing:**
  - Accepts raw `File` objects or `ArrayBuffer` data.
  - Safely extracts rows, skipping header rows, empty rows, and decorative title rows.
  - Tolerates varied column headers:
    - Medicine name: `Tên thuốc`, `Tên hàng`, `Tên sản phẩm`, `Thuốc`, `Medicine Name`.
    - Quantity: `Số lượng`, `SL`, `Số lượng nhập`, `Qty`, `Quantity`.
    - Packaging / Spec: `Quy cách`, `Đóng gói`, `Spec`.
    - Brand / Manufacturer: `Thương hiệu`, `Nhà sản xuất`, `Hãng SX`, `Brand`.
    - Price (optional): `Đơn giá`, `Giá`, `Price`.
  - Parses Vietnamese numeric formats for quantity (handling integers, string numbers, comma/period decimals, and invalid values).
- **Dosage-Preserving Pharma Normalization:**
  - Extracts numeric dosage tokens with units (`mg`, `g`, `ml`, `%`, `mcg`) and standalone dosage numbers.
  - Look-Alike Sound-Alike (LASA) Protection: If two medicines share a base name but have conflicting dosages (e.g., `281.25mg` vs `562.5mg`, or `250mg` vs `500mg`), the engine must **never** auto-classify them as a Confident Match. Conflicting dosages must demote the result to Suggested or Unmatched.
- **Multi-Layer Classification:**
  - Input: Array of parsed raw Excel rows, clinic's active medicine catalog array, and clinic's alias mapping dictionary.
  - Output: Structured array where each element contains:
    - `rawRow`: Original spreadsheet data (`name`, `quantity`, `spec`, `brand`, `price`, `rowIndex`).
    - `matchedMedicineId`: ID of the recommended catalog medicine (if any).
    - `matchedMedicine`: Complete medicine object from catalog (if any).
    - `confidenceStatus`: `'CONFIDENT' | 'SUGGESTED' | 'UNMATCHED'`.
    - `matchScore`: Numeric score between `0` and `1.0`.
    - `matchSource`: `'EXACT' | 'ALIAS' | 'NORMALIZED' | 'FUZZY' | 'NONE'`.
    - `candidateSuggestions`: Top 3 nearest matching candidates from the catalog for suggested/unmatched rows.

### Non-Functional Requirements
- **Performance:** Matching 200 Excel rows against a catalog of 500 medicines must run client-side in under 100 milliseconds without freezing the UI thread.
- **Deterministic:** The same input file and catalog state must always produce identical matching and scoring results.
- **Clean Architecture:** The matching logic must remain pure functions without side effects or direct network dependencies, making it portable and easy to unit test.

---

## 4. Constraints

- Must work in modern browser JavaScript / Web Worker contexts.
- Spreadsheet parser must not rely on server-side Python or external microservices.
- Must accurately handle Vietnamese Unicode diacritics and composite characters (NFC/NFD normalization).

---

## 5. Dependencies

- `xlsx` (SheetJS) or lightweight spreadsheet parsing dependency.
- `src/types/database.ts` (`Medicine`).
- Clinic catalog structure from `useMedicineCatalog.ts`.
- Vitest testing framework.

---

## 6. Acceptance Criteria

1. **Parser Resilience:** Parses `Danh_sach_thuoc.xlsx` correctly, extracting 10 valid medicine rows with names, brands, specifications, and integer/decimal quantities.
2. **Exact & Alias Resolution:**
   - Any raw name existing verbatim in the catalog or in the alias dictionary resolves as `CONFIDENT` with score `1.0`.
3. **Prefix/Suffix Stripping:**
   - `Thuốc Xịt Mũi Aladka 15ml` successfully resolves to catalog medicine `Aladka` (ID 139) with volume validation.
   - `Atersin (Chai 60ml)` successfully matches `ATErsin` (ID 5).
   - `Oran-C` successfully matches `Oran C` (ID 9984).
4. **Dosage Guard:**
   - `Augbactam 281,25mg` is never falsely matched to a `500mg` or `1g` variant.
5. **Score Categorization:** Every row is deterministically categorized as `CONFIDENT`, `SUGGESTED`, or `UNMATCHED`.
6. **All criteria validated by test suite:** The single comprehensive test passes with 100% assertions covering all matching layers and edge cases.

---

## 7. Comprehensive File-Based Test Specification

**Test File:** `tests/phase-02-excel-pharma-matcher.test.ts`

The test suite must verify parsing and matching accuracy against synthesized and real-world fixture datasets:
1. **Spreadsheet Ingestion Test:** Parses binary mock workbook containing diverse column header variations and extracts clean structured rows while ignoring empty/trailing rows.
2. **Alias Resolution Priority Test:** Verifies that an explicit alias in the alias dictionary immediately resolves an otherwise ambiguous name with 100% confidence.
3. **Pharma Normalization Test:** Tests unaccenting, punctuation stripping, and removal of common Vietnamese medicine stop words (`Thuốc`, `Siro`, `dạng ống`, `Chai 60ml`).
4. **Real-World Fixture Matching Test:** Directly tests matching against items from `Danh_sach_thuoc.xlsx`:
   - `Atersin (Chai 60ml)` $\rightarrow$ `ATErsin` (Matched).
   - `Thuốc Xịt Mũi Aladka 15ml` $\rightarrow$ `Aladka` (Matched).
   - `Neo-Beta 5ml` $\rightarrow$ `Neo-Beta` (Matched).
   - `Oran-C` $\rightarrow$ `Oran C` (Matched).
   - `Augxicine 250mg/31,25mg` $\rightarrow$ `Augixine 250mg` (Suggested / Fuzzy Matched).
5. **Dosage Mismatch Protection Test:** Asserts that medicines with differing numeric dosage tokens (e.g., `Augbactam 281.25mg` vs `Augbactam 562.5mg`) are flagged as distinct items and never auto-merged.
6. **Candidate Suggestions Generation Test:** Verifies that suggested and unmatched rows receive a prioritized list of top 3 nearest candidates for user dropdown selection.

