import { POST } from '../route';
import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAuthUser } from '@/lib/supabase/auth';

// Mock getAuthUser
vi.mock('@/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

describe('POST /api/medicine-dosage', () => {
  const originalEnv = process.env;

  const validJsonResponse = JSON.stringify({
    medicine_name: 'Paracetamol',
    adult_dosage: 'Dosage from key 2',
    children_dosage: 'Dosage from key 2',
    usage_instructions: 'Dosage from key 2',
    description: 'Dosage from key 2'
  });

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, GEMINI_API_KEYS: 'key1,key2' };
    vi.stubGlobal('fetch', vi.fn());
    // Mock Math.random to always start with index 0 for predictable testing
    vi.spyOn(Math, 'random').mockReturnValue(0);
    // Default mock for getAuthUser: authorized
    (getAuthUser as any).mockResolvedValue({ user: { id: 'test-user' }, supabase: {} });
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should rotate keys if the first one fails with 429', async () => {
    // First call returns 429, second call returns 200
    (global.fetch as any)
      .mockResolvedValueOnce({ 
        status: 429,
        json: async () => ({ error: 'Rate limit' }) 
      })
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
    expect(data.data.adult_dosage).toBe('Dosage from key 2');
    expect(global.fetch).toHaveBeenCalledTimes(2);
    
    // Verify first key was used
    expect((global.fetch as any).mock.calls[0][0]).toContain('key=key1');
    // Verify second key was used
    expect((global.fetch as any).mock.calls[1][0]).toContain('key=key2');
  });

  it('should rotate keys if the first one fails with 503', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({ status: 503 })
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
    expect(response.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should return 503 if all keys fail', async () => {
    (global.fetch as any).mockResolvedValue({ status: 429 });

    const req = new NextRequest('http://localhost/api/medicine-dosage', {
      method: 'POST',
      body: JSON.stringify({ medicineName: 'Paracetamol' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(503);
    const data = await response.json();
    expect(data.error).toContain('Tất cả API key đều thất bại');
  });

  it('should handle invalid medicine name', async () => {
    const req = new NextRequest('http://localhost/api/medicine-dosage', {
      method: 'POST',
      body: JSON.stringify({ medicineName: '' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it('should return 401 if unauthorized', async () => {
    // Mock getAuthUser to throw (simulating unauthorized)
    (getAuthUser as any).mockRejectedValue(new Error('Unauthorized'));

    const req = new NextRequest('http://localhost/api/medicine-dosage', {
      method: 'POST',
      body: JSON.stringify({ medicineName: 'Paracetamol' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });
});
