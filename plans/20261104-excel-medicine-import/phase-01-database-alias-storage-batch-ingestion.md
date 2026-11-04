# Phase 01: Database Alias Storage & Atomic Batch Ingestion

**Status:** ✅ Completed  
**Dependencies:** Existing `medicines`, `inventory_transaction_logs`, `clinics`, and `auth.users` tables.

---

## 1. Objective

Establish the persistent multi-tenant data foundation for medicine name alias mapping and create secure, atomic server actions to query aliases, save user-confirmed alias mappings, and perform atomic bulk stock increments with complete audit logging.

---

## 2. Scope

- **In Scope:**
  - Create database migration for the `medicine_aliases` table to store supplier raw name mappings per clinic.
  - Implement Row Level Security (RLS) policies on `medicine_aliases` guaranteeing strict tenant isolation by `clinic_id`.
  - Implement server actions or repository methods to:
    - Retrieve all alias mappings for the authenticated user's clinic.
    - Upsert newly approved alias mappings in bulk (`clinic_id`, `raw_name`, `medicine_id`).
    - Execute atomic batch stock ingestion that increments existing medicine stock quantities (`stock_quantity = stock_quantity + quantity_to_add`), writes corresponding entries to `inventory_transaction_logs` (`transaction_type` / `reason = 'IMPORT_EXCEL'`), and supports optional on-the-fly creation of approved new medicines.
  - Create a single comprehensive file-based test verifying tenant isolation, alias upsert deduplication, atomic stock increments, audit trail creation, and rollback behavior on partial failures.

- **Out of Scope:**
  - Parsing spreadsheet binaries or CSV files (handled in Phase 02).
  - Fuzzy matching algorithms or text normalization (handled in Phase 02).
  - Frontend React UI components, file dropzones, and modals (handled in Phase 03).

---

## 3. Requirements

### Functional Requirements
- **Multi-Tenant Alias Schema:**
  - Define `medicine_aliases` with columns:
    - `id` (bigint / bigserial primary key)
    - `clinic_id` (bigint foreign key to `clinics.id`, not null)
    - `raw_name` (text, trimmed, not null)
    - `medicine_id` (bigint foreign key to `medicines.id` on delete cascade, not null)
    - `created_at` (timestamptz default now())
  - Enforce uniqueness on `(clinic_id, raw_name)` to prevent duplicate alias mappings within the same clinic.
- **Tenant Isolation Policies:**
  - Enable RLS on `medicine_aliases`. Authenticated clinic members may only read and insert/update aliases belonging to their active `clinic_id`.
- **Alias Management Actions:**
  - `getMedicineAliases()`: Returns an indexed dictionary or array of `{ raw_name, medicine_id }` for the current tenant.
  - `saveMedicineAliases(mappings)`: Upserts pairs of raw names and target medicine IDs. If an alias already exists for that clinic, update the target `medicine_id` and timestamp.
- **Atomic Stock Ingestion Action:**
  - `importMedicineStockBatch(payload)`:
    - Accepts an array of stock adjustments: `{ medicine_id: number, quantity: number }` where `quantity > 0`.
    - Accepts an optional array of new medicines to register: `{ name: string, packing_spec?: string, unit?: string, price?: number, initial_stock: number }`.
    - Atomically increments `medicines.stock_quantity` for each specified medicine belonging to the caller's clinic.
    - Creates corresponding audit log entries in `inventory_transaction_logs` capturing `old_quantity`, `new_quantity`, `adjustment` (+quantity), and `reason` indicating bulk Excel import.
    - Rolls back entirely if any row fails validation or belongs to an unauthorized clinic.

### Non-Functional Requirements
- **Atomicity:** Bulk updates must occur within a single database transaction or atomic RPC call to eliminate half-imported states during network drops.
- **Concurrency Safety:** Apply appropriate row-level locking (`FOR UPDATE`) when reading and updating stock quantities to prevent lost updates under concurrent prescriber usage.
- **Execution Performance:** Processing a shipment batch of 50 to 200 items must complete in under 500ms on the database.

---

## 4. Constraints

- Must leverage existing PostgreSQL 17 multi-tenant architecture and Supabase RLS patterns established in `audit.11.2026.md`.
- Tenant context must be resolved securely from authenticated session metadata (`getAuthUser()`) and never trusted from unverified client parameters.
- Must preserve existing `medicines` pricing and metadata; stock ingestion must be purely additive (`new_stock = old_stock + imported_quantity`).

---

## 5. Dependencies

- `src/actions/auth.ts` or `getAuthUser()` for secure clinic session resolution.
- `src/types/database.ts` for TypeScript database definitions.
- PostgreSQL table `inventory_transaction_logs`.
- Vitest testing environment.

---

## 6. Acceptance Criteria

1. **Schema Migration:** Migration executes cleanly, establishing `medicine_aliases` with composite unique constraint `(clinic_id, raw_name)` and RLS enabled.
2. **Cross-Tenant Protection:** Attempting to query or insert aliases for a different `clinic_id` is blocked by RLS policies.
3. **Additive Ingestion:** Calling the batch ingestion action with quantity `+20` on a medicine with existing stock `10` results in `stock_quantity = 30`.
4. **Audit Integrity:** Every adjusted medicine generates an entry in `inventory_transaction_logs` with accurate previous and updated quantities and import reason.
5. **Alias Upsert:** Saving aliases with identical `raw_name` updates the existing record without throwing unique constraint violations.
6. **All criteria validated by test suite:** The single comprehensive test passes with 100% coverage of success and failure branches.

---

## 7. Comprehensive File-Based Test Specification

**Test File:** `tests/phase-01-medicine-import-backend.test.ts`

The test suite must verify the backend ingestion and alias persistence contract end-to-end:
1. **Tenant Isolation Test:** Asserts that `getMedicineAliases()` returns only aliases matching the authenticated clinic ID and ignores aliases belonging to other clinics.
2. **Alias Upsert Deduplication Test:** Verifies that passing multiple or existing raw names updates existing records smoothly via `ON CONFLICT (clinic_id, raw_name) DO UPDATE`.
3. **Additive Stock Ingestion Test:** Verifies that a batch of multiple medicines with initial stocks `[0, 15, 50]` updated with quantities `[20, 10, 5]` results in exact new stocks `[20, 25, 55]`.
4. **Inventory Transaction Audit Test:** Asserts that each adjusted medicine generates a valid log row in `inventory_transaction_logs` with `old_quantity`, `new_quantity`, positive `adjustment`, and proper reason tag.
5. **Transaction Rollback Test:** Asserts that if an invalid medicine ID or foreign clinic medicine ID is included in the batch, the entire operation throws an error and no stock quantities or logs are committed.

