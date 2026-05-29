# Audit Report - Medicines Logic Fix
Created: 2026-05-11
Phase: 00 - Audit & Code Mapping

## 1. Table Analysis: `medicines`
- **Location**: `supabase/migrations/001_initial_schema.sql` (creation), `20260427181500_rls_redesign.sql` (clinic_id addition).
- **Columns to modify**:
  - `price`: `REAL` -> `NUMERIC(15,2)` (or similar precision).
- **Related Tables**:
  - `prescriptions_header`: `total_amount` (`REAL` -> `NUMERIC`), `consultation_fee` (`REAL` -> `NUMERIC`).
  - `prescription_details`: `unit_price` (`REAL` -> `NUMERIC`).

## 2. RPC Discovery
The following RPCs interact with the `medicines` table and need auditing/modification:

| RPC Name | File Location | Purpose | Impact of Change |
|----------|---------------|---------|------------------|
| `adjust_medicine_stock` | `20260427184000_inventory_fixes.sql` | Manual stock adjustment | None (uses INTEGER) |
| `get_low_stock_medicines` | `20260427184000_inventory_fixes.sql` | Alerting | None |
| `create_prescription` | `20260510_unify_prescription_transaction.sql` | Atomic prescription + stock deduction | Calculation uses `REAL` |
| `update_prescription` | `20260427181500_rls_redesign.sql` | Update + restore/deduct stock | Calculation uses `REAL` |
| `delete_prescription` | `20260427181500_rls_redesign.sql` | Delete + restore stock | None |

## 3. Codebase Impact
Files that need to be checked for type compatibility after DB change:
- `src/types/database.ts`: `Medicine`, `PrescriptionHeader`, `PrescriptionDetail` interfaces.
- `src/actions/medicines.ts`: 
  - `getLowStockMedicines` (Line 150): Fallback JS filtering is a performance risk.
  - `isMedicineInUse`: Missing tenant context in query.
- `src/actions/prescriptions.ts`: Atomic RPC calls (already uses `Math.round`).
- `src/lib/validations/medicine.ts`: Zod validation for price.
- `src/lib/validations/prescription.ts`: Zod validation for unit_price.

## 4. Security Audit: Multi-tenancy
- `get_my_clinic_id()` is reliable but requires `public.profiles` to exist for every user.
- **Risk**: `medicines` table has global `UNIQUE(name)` constraint in `001_initial_schema.sql` (Line 33).
- **Risk**: `clinic_id` default value is `1` in `rls_redesign.sql`, leading to potential data leakage.
- **Mitigation**: Ensure all RPCs check `IF v_clinic_id IS NULL THEN RAISE EXCEPTION`. (Most already do, but need to verify all).

## 5. Specific Issues from `medi.md`
- [x] Multi-tenant data leakage (UNIQUE name collision & default clinic_id).
- [x] Financial precision (REAL -> NUMERIC).
- [x] Inventory integrity (Non-atomic updates in `update_prescription`).
- [x] Performance (Client-side filtering fallback).
