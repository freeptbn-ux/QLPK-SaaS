# Plan: Three-Tier Stock Status Classification

Created: 2026-08-07
Status: 🟡 Planning

## Overview

Currently, the medicine stock system uses a binary classification:
- `stock_quantity <= min_stock_level` → "Sắp hết" (Low stock)
- Otherwise → "Còn hàng" (In stock)

This plan introduces a **three-tier** classification:
- `stock_quantity = 0` → **"Đã hết"** (Out of stock) — NEW
- `0 < stock_quantity <= min_stock_level` → **"Sắp hết"** (Low stock)
- `stock_quantity > min_stock_level` → **"Còn hàng"** (In stock)

## Affected Files Summary

| Layer | File | Change |
|-------|------|--------|
| SQL | `get_low_stock_count()` | Split into low stock + out of stock counts |
| SQL | `get_low_stock_medicines()` | Exclude `stock_quantity = 0` (those are "out of stock", not "low stock") |
| SQL | NEW `get_out_of_stock_count()` | Count medicines with `stock_quantity = 0` |
| Server Action | `src/actions/medicines.ts` | Add `getOutOfStockCount()` |
| Server Action | `src/actions/statistics.ts` | Return `outOfStockCount` alongside `lowStockCount` |
| Page | `src/app/(dashboard)/medicines/page.tsx` | Pass out-of-stock count to MedicineList |
| Component | `src/components/features/medicines/MedicineList.tsx` | 3-state badge, 3-state filter, 3-state stock color |
| Component | `src/components/features/medicines/LowStockAlert.tsx` | Show both low-stock and out-of-stock counts |
| Component | `src/components/features/statistics/StatsOverview.tsx` | Add out-of-stock card or merge display |
| Component | `src/components/features/prescriptions/MedicineAutocomplete.tsx` | Already handles `stock_quantity === 0` — just verify consistency |

## Phases

| Phase | Name | Status | File |
|-------|------|--------|------|
| 01 | Database & Backend | ⬜ Pending | `phase-01-database-backend.md` |
| 02 | Frontend UI Components | ⬜ Pending | `phase-02-frontend-ui.md` |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
