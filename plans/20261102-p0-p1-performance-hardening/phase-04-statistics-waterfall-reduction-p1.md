# Phase 04: Statistics & Dashboard Waterfall Query Reduction (P1)

**Target Issues:** PERF-006  
**Severity:** 🟠 High (P1)  
**Status:** ✅ Completed  
**Dependencies:** Phase 01, Phase 02, Phase 03  

---

## 1. Objective

Eliminate the 14-query network waterfall spanning 8 Server Actions during the `/statistics` page load. Consolidate analytics, financial summaries, trend charts, and medication distribution queries into a unified, high-performance data retrieval mechanism that provides all dashboard data in a minimal number of database round-trips ($\le 2$, ideally 1).

---

## 2. Scope

- **In Scope:**
  - Audit the data fetching architecture in `src/actions/statistics.ts` and `src/app/(dashboard)/statistics/page.tsx`.
  - Consolidate multiple fragmented server actions (`getOverviewStats`, `getRevenueChartData`, `getTopMedicines`, `getPatientDemographics`, etc.) into a unified retrieval strategy (e.g., a consolidated RPC or single coordinated Server Action).
  - Return all necessary metric payloads in a single round-trip:
    1. Financial KPIs (total revenue, prescription count, total patient visits, average prescription value).
    2. Date-series trend data (daily revenue and visit counts).
    3. Top prescribed medicines (name, quantity, total value).
    4. Patient demographics breakdown (gender, age groups).
  - Preserve date-filtering capabilities (today, 7 days, 30 days, custom date range).
  - Implement a comprehensive file-based test suite verifying data completeness and round-trip reduction.

- **Out of Scope:**
  - Modifying Recharts UI components or chart rendering libraries.
  - Changing CSV or PDF export report formats.

---

## 3. Requirements

### Functional Requirements
- **Comprehensive Dashboard Payload:** The consolidated query must supply all data required by the statistics overview, charts, and table widgets for the selected date range.
- **Date Filter Parity:** Must support identical filtering presets and date intervals (start date to end date) currently supported by the UI.
- **Tenant Scoping:** All aggregations must be strictly isolated to the caller's `clinic_id`.

### Non-Functional & Performance Requirements
- **Round-Trip Elimination:** The number of sequential and parallel database round trips executed to render the statistics dashboard must be reduced from 14 down to $\le 2$.
- **Latency & Throughput:** Server response latency for statistics generation must drop significantly under typical clinic data volumes by querying pre-aggregated tables (`clinic_daily_stats`) in a single pass rather than scanning raw tables multiple times in separate queries.

---

## 4. Constraints

- Must maintain backward compatibility with existing component prop interfaces where feasible, or cleanly refactor page component data binding.
- Must not bypass tenant isolation or run unindexed full-table scans.

---

## 5. Dependencies

- `src/actions/statistics.ts`
- `src/app/(dashboard)/statistics/page.tsx`
- PostgreSQL pre-aggregated tables: `clinic_daily_stats`
- Vitest testing framework

---

## 6. Acceptance Criteria

1. A unified statistics retrieval mechanism returns the complete dashboard payload (KPI cards, trends, top medicines, demographics) in a single unified execution flow.
2. The number of separate database round-trips executed during statistics loading is $\le 2$.
3. All dashboard metrics match the mathematical aggregates of underlying clinic data for the requested date window.
4. The comprehensive file-based test in `tests/phase-04-statistics-waterfall.test.ts` passes with 100% assertions satisfied.

---

## 7. Comprehensive File-Based Test

**Test File Path:** `tests/phase-04-statistics-waterfall.test.ts`  
**Purpose:** Verify that statistics and dashboard metrics are resolved through a consolidated data flow in $\le 2$ database round trips without missing required UI fields.

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Phase 04: Statistics & Dashboard Waterfall Query Reduction', () => {
  let queryCount = 0;
  let rpcCount = 0;

  // Track database interactions to prove waterfall elimination
  const mockFrom = vi.fn((table: string) => {
    queryCount++;
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };
  });

  const mockRpc = vi.fn((procName: string, params: any) => {
    rpcCount++;
    return Promise.resolve({
      data: {
        kpis: {
          total_revenue: 15000000,
          prescription_count: 75,
          patient_visit_count: 68,
          avg_prescription_value: 200000,
        },
        revenue_trends: [
          { date: '2026-11-01', revenue: 7000000, visits: 30 },
          { date: '2026-11-02', revenue: 8000000, visits: 38 },
        ],
        top_medicines: [
          { name: 'Paracetamol 500mg', total_quantity: 150, total_revenue: 1500000 },
          { name: 'Amoxicillin 500mg', total_quantity: 80, total_revenue: 2400000 },
        ],
        demographics: {
          gender: { male: 32, female: 36, other: 0 },
          age_groups: { under_18: 10, adult: 45, elderly: 13 },
        },
      },
      error: null,
    });
  });

  beforeEach(() => {
    queryCount = 0;
    rpcCount = 0;
    vi.clearAllMocks();
  });

  it('Requirement PERF-006: should retrieve complete statistics payload in <= 2 database operations', async () => {
    vi.mock('@/lib/supabase/server', () => ({
      createClient: vi.fn(async () => ({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'doc-1', app_metadata: { clinic_id: 'c-1', role: 'doctor' } } },
            error: null,
          }),
        },
        from: mockFrom,
        rpc: mockRpc,
      })),
    }));

    vi.mock('@/lib/supabase/auth', () => ({
      getAuthUser: vi.fn().mockResolvedValue({
        user: { id: 'doc-1' },
        clinic_id: 'c-1',
        role: 'doctor',
      }),
    }));

    // Import the consolidated statistics action
    const statsModule = await import('@/actions/statistics');

    // Call the primary dashboard data fetcher
    // If refactored into getDashboardStatistics or unified action
    const fetcher = (statsModule as any).getDashboardStatistics || (statsModule as any).getUnifiedStatistics;
    
    expect(typeof fetcher).toBe('function');

    const result = await fetcher({
      startDate: '2026-11-01',
      endDate: '2026-11-02',
    });

    // 1. Verify total database operations is <= 2
    const totalDbOperations = queryCount + rpcCount;
    expect(totalDbOperations).toBeGreaterThan(0);
    expect(totalDbOperations).toBeLessThanOrEqual(2);

    // 2. Verify all expected sections are present in payload
    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.data.kpis).toBeDefined();
    expect(result.data.kpis.total_revenue).toBeDefined();
    expect(result.data.revenue_trends).toBeInstanceOf(Array);
    expect(result.data.top_medicines).toBeInstanceOf(Array);
  });
});
```

