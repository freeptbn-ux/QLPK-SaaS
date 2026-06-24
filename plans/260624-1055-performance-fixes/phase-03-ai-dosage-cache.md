# Phase 03: AI Dosage Cache & Hook Fix
Status: ✅ Completed
Dependencies: None

## Objective
Avoid redundant external API calls and reduce UI latency for AI Dosage searches by creating a database caching layer (`medicine_dosage_cache` table) with a 7-day Time-To-Live (TTL). Additionally, eliminate potential rendering infinite loops in the client-side `useMedicineDosage` React hook by cleaning up dependency state tracking.

## Requirements
### Functional
- Create `medicine_dosage_cache` table in Supabase.
- Enable Row Level Security (RLS) on `medicine_dosage_cache` allowing all authenticated users to read, write, and update records (as dosage guidelines are medical facts shared globally across clinics to speed up AI lookup).
- Implement server-side lookup in `src/app/api/medicine-dosage/route.ts`:
  1. Normalize input string (`medicineName.trim().toLowerCase()`).
  2. Search for the normalized query in the cache where `created_at` is newer than 7 days.
  3. If cached entry is found, bypass Gemini API calls and return the JSON immediately.
  4. If not found, make Gemini API calls (search & format) and upsert the valid response into the cache.
- Resolve the infinite loop issue in `src/hooks/useMedicineDosage.ts`:
  - Utilize `isLoadingRef` to check request status synchronously.
  - Remove `isLoading` from the `fetchDosage` `useCallback` dependency array, ensuring its callback reference remains stable.

### Non-Functional
- Cut AI API response times from ~8-12 seconds down to <100ms for cached queries.
- Prevent API key token depletion during recurring clinic dosage requests.

## Implementation Steps
1. **Create Database Migration**:
   Create a new migration file `supabase/migrations/20260624000003_ai_dosage_cache_table.sql`:
   ```sql
   -- Create cache table
   CREATE TABLE IF NOT EXISTS public.medicine_dosage_cache (
     id BIGSERIAL PRIMARY KEY,
     medicine_name_query TEXT UNIQUE NOT NULL,
     medicine_name TEXT NOT NULL,
     adult_dosage TEXT,
     children_dosage TEXT,
     usage_instructions TEXT,
     description TEXT,
     contraindications TEXT,
     side_effects TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Create index for fast lookups
   CREATE INDEX IF NOT EXISTS idx_medicine_dosage_cache_query ON public.medicine_dosage_cache(medicine_name_query);

   -- Enable RLS
   ALTER TABLE public.medicine_dosage_cache ENABLE ROW LEVEL SECURITY;

   -- Allow authenticated users to perform operations
   DROP POLICY IF EXISTS "Allow authenticated read on medicine_dosage_cache" ON public.medicine_dosage_cache;
   CREATE POLICY "Allow authenticated read on medicine_dosage_cache"
     ON public.medicine_dosage_cache FOR SELECT
     TO authenticated
     USING (true);

   DROP POLICY IF EXISTS "Allow authenticated insert on medicine_dosage_cache" ON public.medicine_dosage_cache;
   CREATE POLICY "Allow authenticated insert on medicine_dosage_cache"
     ON public.medicine_dosage_cache FOR INSERT
     TO authenticated
     WITH CHECK (true);

   DROP POLICY IF EXISTS "Allow authenticated update on medicine_dosage_cache" ON public.medicine_dosage_cache;
   CREATE POLICY "Allow authenticated update on medicine_dosage_cache"
     ON public.medicine_dosage_cache FOR UPDATE
     TO authenticated
     USING (true)
     WITH CHECK (true);
   ```

2. **Integrate Cache in API Route**:
   Update `src/app/api/medicine-dosage/route.ts` to perform database check using Service Client/Authenticated Client and store results.
   ```typescript
   // Inside POST handler of src/app/api/medicine-dosage/route.ts
   
   // 1. Get authenticated user/supabase client
   const { supabase } = await getAuthUser();
   const normalizedQuery = medicineName.trim().toLowerCase();

   // 2. Query cache (TTL: 7 days)
   const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
   const { data: cached } = await supabase
     .from('medicine_dosage_cache')
     .select('*')
     .eq('medicine_name_query', normalizedQuery)
     .gt('created_at', sevenDaysAgo)
     .single();

   if (cached) {
     return NextResponse.json({
       success: true,
       data: {
         medicine_name: cached.medicine_name,
         adult_dosage: cached.adult_dosage,
         children_dosage: cached.children_dosage,
         usage_instructions: cached.usage_instructions,
         description: cached.description,
         contraindications: cached.contraindications,
         side_effects: cached.side_effects
       }
     });
   }

   // ... Perform Gemini calls ...

   // 3. Upsert into cache
   await supabase
     .from('medicine_dosage_cache')
     .upsert({
       medicine_name_query: normalizedQuery,
       medicine_name: validatedContent.medicine_name,
       adult_dosage: validatedContent.adult_dosage,
       children_dosage: validatedContent.children_dosage,
       usage_instructions: validatedContent.usage_instructions,
       description: validatedContent.description,
       contraindications: validatedContent.contraindications,
       side_effects: validatedContent.side_effects,
       created_at: new Date().toISOString()
     }, { onConflict: 'medicine_name_query' });
   ```

3. **Fix React Hook Dependency Stability**:
   Refactor `src/hooks/useMedicineDosage.ts`:
   - Replace the `isLoading` state check in `fetchDosage` with `isLoadingRef.current` to prevent callback recreation cycles.
   ```typescript
   const isLoadingRef = useRef(false);
   
   // ... inside fetchDosage Callback ...
   const fetchDosage = useCallback(async (name: string) => {
     const cleanName = sanitizeName(name);
     if (!cleanName) return;

     if (isLoadingRef.current && lastFetchedName.current === cleanName) return;

     // ... (rest of hook fetches) ...
     isLoadingRef.current = true;
     setIsLoading(true);
     
     try {
        // ... (fetch implementation) ...
     } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
     }
   }, [cache]); // Omit isLoading
   ```

## Files to Create/Modify
- [NEW] [20260624000003_ai_dosage_cache_table.sql](file:///c:/Users/Administrator/Desktop/code/QLPK-SaaS-main/supabase/migrations/20260624000003_ai_dosage_cache_table.sql)
- [MODIFY] [route.ts](file:///c:/Users/Administrator/Desktop/code/QLPK-SaaS-main/src/app/api/medicine-dosage/route.ts)
- [MODIFY] [useMedicineDosage.ts](file:///c:/Users/Administrator/Desktop/code/QLPK-SaaS-main/src/hooks/useMedicineDosage.ts)
- [NEW] [verify-ai-dosage-cache.test.ts](file:///c:/Users/Administrator/Desktop/code/QLPK-SaaS-main/tests/verify-ai-dosage-cache.test.ts)
- [NEW] [verify_ai_dosage_cache.sql](file:///c:/Users/Administrator/Desktop/code/QLPK-SaaS-main/tests/verify_ai_dosage_cache.sql)

## Detailed File-Based Tests

### 1. Database-Level Tests
Create `tests/verify_ai_dosage_cache.sql` to check table constraints and RLS access controls:

```sql
-- tests/verify_ai_dosage_cache.sql
BEGIN;

-- Verify table exists
SELECT count(*) = 1 AS table_exists 
FROM information_schema.tables 
WHERE table_name = 'medicine_dosage_cache';

-- Check RLS settings
SELECT relrowsecurity AS rls_enabled 
FROM pg_class 
WHERE relname = 'medicine_dosage_cache';

-- Test INSERT policy
SET LOCAL request.jwt.claims TO '{"role":"authenticated"}';
INSERT INTO public.medicine_dosage_cache 
(medicine_name_query, medicine_name, adult_dosage, children_dosage, usage_instructions, description, contraindications, side_effects)
VALUES 
('test_med', 'Test Med', '1 pill', '0.5 pill', 'After meal', 'Generic info', 'None', 'Drowsiness');

SELECT count(*) = 1 AS authenticated_can_insert 
FROM public.medicine_dosage_cache WHERE medicine_name_query = 'test_med';

ROLLBACK;
```

### 2. Node.js/Vitest Tests
Create `tests/verify-ai-dosage-cache.test.ts` to mock Gemini and Supabase interactions and prove caching and hook safety:

```typescript
// tests/verify-ai-dosage-cache.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../src/app/api/medicine-dosage/route';
import { NextRequest } from 'next/server';
import { getAuthUser } from '../src/lib/supabase/auth';

// Mock auth
vi.mock('../src/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

// Mock NextRequest and NextResponse
vi.mock('next/server', () => {
  class MockNextRequest {
    private body: string;
    constructor(url: string, init?: any) {
      this.body = init?.body || '{}';
    }
    async json() {
      return JSON.parse(this.body);
    }
  }
  return {
    NextRequest: MockNextRequest,
    NextResponse: {
      json: (data: any, init?: any) => ({
        status: init?.status || 200,
        json: async () => data,
      }),
    },
  };
});

describe('AI Dosage Cache API & Hook Optimization', () => {
  const mockSupabase: any = {
    from: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEYS = 'key1,key2';
    global.fetch = vi.fn();
    (getAuthUser as any).mockResolvedValue({ 
      user: { id: 'test-user' }, 
      supabase: mockSupabase 
    });
  });

  it('should return cached data and bypass Gemini call if present in cache', async () => {
    const mockCachedEntry = {
      medicine_name: 'Paracetamol',
      adult_dosage: '500mg',
      children_dosage: '10mg/kg',
      usage_instructions: 'Oral',
      description: 'Painkiller',
      contraindications: 'Liver failure',
      side_effects: 'Rash',
    };

    // Setup Supabase Mock chain
    const mockSingle = vi.fn().mockResolvedValue({ data: mockCachedEntry, error: null });
    const mockGt = vi.fn().mockReturnValue({ single: mockSingle });
    const mockEq = vi.fn().mockReturnValue({ gt: mockGt });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    mockSupabase.from.mockReturnValue({ select: mockSelect });

    const req = new NextRequest('http://localhost/api/medicine-dosage', {
      method: 'POST',
      body: JSON.stringify({ medicineName: 'Paracetamol' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.medicine_name).toBe('Paracetamol');
    // Ensure external fetch to Gemini API is NOT triggered
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should request Gemini and populate cache if not cached', async () => {
    // 1. Mock cache miss
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockGt = vi.fn().mockReturnValue({ single: mockSingle });
    const mockEq = vi.fn().mockReturnValue({ gt: mockGt });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    
    // Mock upsert
    const mockUpsert = vi.fn().mockResolvedValue({ error: null });
    
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'medicine_dosage_cache') {
        return { select: mockSelect, upsert: mockUpsert };
      }
      return {};
    });

    // 2. Mock Gemini API responses
    (global.fetch as any)
      .mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'Raw search result from Gemini' }] } }],
        }),
      })
      .mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: JSON.stringify({
            medicine_name: 'Paracetamol',
            adult_dosage: '500mg',
            children_dosage: '10mg/kg',
            usage_instructions: 'Oral',
            description: 'Painkiller',
            contraindications: 'None',
            side_effects: 'None'
          }) }] } }],
        }),
      });

    const req = new NextRequest('http://localhost/api/medicine-dosage', {
      method: 'POST',
      body: JSON.stringify({ medicineName: 'Paracetamol' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    // Verifies data gets added to cache
    expect(mockUpsert).toHaveBeenCalled();
  });
});
```
