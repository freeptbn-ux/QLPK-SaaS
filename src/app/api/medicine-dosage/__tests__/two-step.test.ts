import { POST } from '../route';
import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAuthUser } from '@/lib/supabase/auth';

// Mock getAuthUser
vi.mock('@/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

describe('POST /api/medicine-dosage - Two-Step Architecture', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, GEMINI_API_KEYS: 'key1' };
    vi.stubGlobal('fetch', vi.fn());
    vi.spyOn(Math, 'random').mockReturnValue(0);
    (getAuthUser as any).mockResolvedValue({ user: { id: 'test-user' } });
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should successfully complete both steps', async () => {
    const mockSearchResponse = {
      candidates: [{ content: { parts: [{ text: 'Step 1: Found Paracetamol info...' }] } }]
    };
    const mockFormatResponse = {
      candidates: [{ 
        content: { 
          parts: [{ 
            text: JSON.stringify({
              medicine_name: 'Paracetamol',
              adult_dosage: '500mg every 4-6 hours',
              children_dosage: 'Based on weight',
              usage_instructions: 'Take with water',
              description: 'Common painkiller',
              contraindications: 'Hypersensitivity',
              side_effects: 'Nausea'
            }) 
          }] 
        } 
      }]
    };

    (global.fetch as any)
      .mockResolvedValueOnce({
        status: 200,
        json: async () => mockSearchResponse
      })
      .mockResolvedValueOnce({
        status: 200,
        json: async () => mockFormatResponse
      });

    const req = new NextRequest('http://localhost/api/medicine-dosage', {
      method: 'POST',
      body: JSON.stringify({ medicineName: 'Paracetamol' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.medicine_name).toBe('Paracetamol');
    
    // Verify fetch was called twice
    expect(global.fetch).toHaveBeenCalledTimes(2);

    // Verify Step 1 call (Search)
    const step1Call = (global.fetch as any).mock.calls[0];
    const step1Body = JSON.parse(step1Call[1].body);
    expect(step1Body.tools).toBeDefined();
    expect(step1Body.tools[0].google_search).toBeDefined();
    expect(step1Body.generationConfig).toBeUndefined();

    // Verify Step 2 call (Format)
    const step2Call = (global.fetch as any).mock.calls[1];
    const step2Body = JSON.parse(step2Call[1].body);
    expect(step2Body.tools).toBeUndefined();
    expect(step2Body.generationConfig.response_mime_type).toBe('application/json');
    expect(step2Body.contents[0].parts[0].text).toContain('Step 1: Found Paracetamol info...');
  });

  it('should return 503 if Step 1 fails', async () => {
    (global.fetch as any).mockResolvedValue({ status: 429 });

    const req = new NextRequest('http://localhost/api/medicine-dosage', {
      method: 'POST',
      body: JSON.stringify({ medicineName: 'Paracetamol' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toContain('Không thể tìm kiếm');
  });

  it('should return 503 if Step 2 fails after Step 1 succeeds', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'Step 1 success' }] } }]
        })
      })
      .mockResolvedValue({ status: 429 });

    const req = new NextRequest('http://localhost/api/medicine-dosage', {
      method: 'POST',
      body: JSON.stringify({ medicineName: 'Paracetamol' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toContain('Không thể định dạng');
  });
});
