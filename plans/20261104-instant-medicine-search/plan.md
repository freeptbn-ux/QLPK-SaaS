# Implementation Plan: Instant Medicine Autocomplete & Client-Side Catalog Cache

**Plan Directory:** `plans/20261104-instant-medicine-search`  
**Created:** 2026-11-04  
**Status:** ✅ Completed  

---

## 1. Executive Summary

Clinicians currently encounter noticeable typing latency (400ms – 1,000ms delay per keystroke) in `MedicineAutocomplete` during prescription creation (`/patients/[id]/prescribe`). Each keystroke triggers a full serverless network round-trip from the client browser to Vercel and then to Supabase in Singapore.

Because clinic inventory is relatively small (~200 active medicines, payload size ~24 KB uncompressed), querying remote serverless endpoints on every keystroke causes unnecessary latency and spinner delays ("Đang tìm kiếm...").

This plan transitions medicine search to an **Instant Hybrid Client-Side Architecture**:
1. Prefetch active medicines on form mount or background entry.
2. Maintain an in-memory cache with Stale-While-Revalidate (SWR) mechanics and fallback to server search.
3. Perform zero-latency in-memory search with tokenized Vietnamese unaccented matching.
4. Invalidate and revalidate cached catalog data upon inventory adjustments or prescription modifications.

---

## 2. Phased Architecture Breakdown

| Phase | Title | Scope | Deliverables | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 01** | **Client-Side Medicine Catalog Cache Engine** | Catalog fetching & in-memory SWR cache manager | `useMedicineCatalog` hook, TTL/invalidation management, catalog prefetch | ✅ Completed |
| **Phase 02** | **Zero-Latency In-Memory Vietnamese Token Search & Autocomplete UI** | `MedicineAutocomplete` component refactoring | Sub-millisecond keystroke filter, multi-word matching, stock indicators, keyboard navigation | ✅ Completed |
| **Phase 03** | **Prescription Integration, Stock Revalidation & Cache Invalidation** | `PrescriptionForm`, medicine action mutations, cache sync | Stock verification upon selection, mutation revalidation triggers, e2e prescription flow | ✅ Completed |

---

## 3. Phase References

- [Phase 01: Client-Side Medicine Catalog Cache Engine](./phase-01-medicine-catalog-cache-engine.md)
- [Phase 02: Zero-Latency In-Memory Vietnamese Token Search & Autocomplete UI](./phase-02-instant-medicine-autocomplete-ui.md)
- [Phase 03: Prescription Integration, Stock Revalidation & Cache Invalidation](./phase-03-stock-revalidation-cache-sync.md)

