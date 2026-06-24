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
