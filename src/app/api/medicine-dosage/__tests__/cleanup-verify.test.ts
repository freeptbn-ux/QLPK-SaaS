import { POST } from '../route';
import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAuthUser } from '@/lib/supabase/auth';

// Mock getAuthUser
vi.mock('@/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

describe('Cleanup Phase 01 Verification', () => {
  const originalEnv = process.env;

  const validJsonResponse = JSON.stringify({
    medicine_name: 'Paracetamol',
    adult_dosage: '500mg-1000mg every 4-6 hours',
    children_dosage: '10-15mg/kg every 4-6 hours',
    usage_instructions: 'Take with water after meals',
    description: 'Common pain reliever and fever reducer',
    contraindications: 'None',
    side_effects: 'None'
  });

  beforeEach(() => {
    vi.resetModules();
    // Simulate a list of keys to verify rotation and model selection
    process.env = { ...originalEnv, GEMINI_API_KEYS: 'key1,key2,key3' };
    vi.stubGlobal('fetch', vi.fn());
    // Mock Math.random to always start with index 0
    vi.spyOn(Math, 'random').mockReturnValue(0);
    // Mock authorization
    (getAuthUser as any).mockResolvedValue({ user: { id: 'test-user' } });
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should use the gemini-2.5-flash-lite model in the API URL', async () => {
    // Step 1: Search
    (global.fetch as any).mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'Found info' }] } }]
      })
    });
    // Step 2: Format
    (global.fetch as any).mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: validJsonResponse }] } }]
      })
    });

    const req = new NextRequest('http://localhost/api/medicine-dosage', {
      method: 'POST',
      body: JSON.stringify({ medicineName: 'Paracetamol' }),
    });

    await POST(req);
    
    const fetchUrl = (global.fetch as any).mock.calls[0][0];
    
    // REQUIREMENT: Use gemini-2.5-flash-lite
    expect(fetchUrl).toContain('/models/gemini-2.5-flash-lite:generateContent');
  });

  it('should still support key rotation with the new model', async () => {
    // Step 1: Key 1 fails, Key 2 succeeds
    (global.fetch as any)
      .mockResolvedValueOnce({ status: 429 }) // Key 1 search
      .mockResolvedValueOnce({               // Key 2 search
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'Found info' }] } }]
        })
      })
      // Step 2: Key 1 search (Wait, Step 2 loop starts from same startIndex)
      // Step 2 Call 1: Key 1 format
      .mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: validJsonResponse }] } }]
        })
      });

    const req = new NextRequest('http://localhost/api/medicine-dosage', {
      method: 'POST',
      body: JSON.stringify({ medicineName: 'Paracetamol' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    // 2 calls for Step 1, 1 call for Step 2
    expect(global.fetch).toHaveBeenCalledTimes(3);
    
    // Verify calls used the correct model
    expect((global.fetch as any).mock.calls[0][0]).toContain('gemini-2.5-flash-lite');
    expect((global.fetch as any).mock.calls[1][0]).toContain('gemini-2.5-flash-lite');
  });
});
