# Implementation Plan: Excel Medicine Import & Smart Stock Reconciliation

**Plan Directory:** `plans/20261104-excel-medicine-import`  
**Created:** 2026-11-04  
**Status:** 🟡 Pending Review  
**Related Documents:** [docs/BRIEF.md](../../docs/BRIEF.md), `Danh_sach_thuoc.xlsx`

---

## 1. Executive Summary

Clinicians and clinic stock managers frequently receive bulk medicine shipments accompanied by supplier spreadsheets (`.xlsx` or `.csv`). Currently, clinic staff must manually search for each medicine in `/medicines` and enter stock adjustments one-by-one via the manual update dialog.

The primary engineering hurdle is that drug names in supplier spreadsheets rarely match the clinic's internal naming convention 100% (e.g., supplier writes `"Thuốc Xịt Mũi Aladka 15ml"`, internal catalog stores `"Aladka"`; supplier writes `"Agimol 325"`, internal catalog stores `"Paracetamol 325mg Agimol"`; or names differ by formatting, extra punctuation, or packaging specs). Blind automated string matching risks dispensing hazardous Look-Alike Sound-Alike (LASA) errors or mixing up dosage strengths (e.g., 250mg vs 500mg).

This plan introduces an **Excel Medicine Import & Smart Reconciliation** subsystem designed around pharmaceutical inventory best practices:
1. **Additive Stock Ingestion Rule:** Quantities in the Excel sheet add to existing physical stock (`new_stock = old_stock + imported_quantity`). Prices and packaging specifications remain intact unless explicitly modified.
2. **Multi-Layer Matching Engine:** Combines exact matching, persistent clinic-scoped alias memory (`medicine_aliases`), rule-based pharmaceutical normalization (unaccenting, stripping medical filler words while strictly preserving dosage tokens), and fuzzy string similarity.
3. **Persistent Alias Learning:** When a user manually maps an unrecognized supplier name to a clinic medicine, the system persists the pairing per clinic. Subsequent imports of the same supplier sheet resolve with 100% automated confidence.
4. **Human-in-the-Loop Review Table:** Displays an interactive review dialog categorized into High-Confidence (🟢), Needs Confirmation (🟡), and Unmatched (🔴), enabling single-click batch approval, manual search override, or new medicine creation.
5. **Atomic Commit & Cache Invalidation:** Executes stock increments inside an atomic transaction, writes immutable audit records to `inventory_transaction_logs`, and immediately triggers `invalidateMedicineCatalog()` so prescribing clinicians see updated inventory levels in real time.

---

## 2. Phased Architecture Breakdown

| Phase | Title | Scope | Deliverables | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 01** | **Database Alias Storage & Atomic Batch Ingestion** | Schema migration for `medicine_aliases`, RLS policies, and atomic batch stock ingestion actions | SQL migration, alias query/upsert actions, batch stock adjustment server action, audit logging | ✅ Completed |
| **Phase 02** | **Spreadsheet Parser & Multi-Layer Pharma Matching Engine** | Client-side Excel/CSV parsing and 4-tier pharmaceutical normalization/fuzzy matcher | Sheet parser, dosage-preserving normalizer, multi-layer matching classifier, confidence scoring | ✅ Completed |
| **Phase 03** | **Interactive Reconciliation Modal & Catalog Sync** | User interface in `/medicines`, review table, manual override, new medicine creation, cache invalidation | "Nhập thuốc" button, file dropzone dialog, 3-tier review table, atomic execution flow, live cache sync | ✅ Completed |

---

## 3. Phase Specifications

- [Phase 01: Database Alias Storage & Atomic Batch Ingestion](./phase-01-database-alias-storage-batch-ingestion.md)
- [Phase 02: Spreadsheet Parser & Multi-Layer Pharma Matching Engine](./phase-02-excel-parser-and-pharma-matcher.md)
- [Phase 03: Interactive Reconciliation Modal & Catalog Sync](./phase-03-interactive-reconciliation-modal-and-catalog-sync.md)

