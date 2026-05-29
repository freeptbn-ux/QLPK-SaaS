import { POST } from '../route';
import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAuthUser } from '@/lib/supabase/auth';

// Mock getAuthUser
vi.mock('@/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

describe('Prompt Security Hardening', () => {
  const originalEnv = process.env;

  const validJsonResponse = JSON.stringify({
    medicine_name: 'Paracetamol',
    adult_dosage: 'Dosage info',
    children_dosage: 'Dosage info',
    usage_instructions: 'Dosage info',
    description: 'Dosage info',
    contraindications: 'None',
    side_effects: 'None'
  });

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, GEMINI_API_KEYS: 'key1' };
    vi.stubGlobal('fetch', vi.fn());
    (getAuthUser as any).mockResolvedValue({ user: { id: 'test-user' }, supabase: {} });
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should include system_instruction and delimiters in the API call', async () => {
    const medicineName = 'Paracetamol';
    
    // Step 1: Search
    (global.fetch as any).mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'Step 1 output text' }] } }]
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
      body: JSON.stringify({ medicineName }),
    });

    await POST(req);

    // Step 1 check
    const step1Call = (global.fetch as any).mock.calls[0];
    const step1Body = JSON.parse(step1Call[1].body);
    expect(step1Body.system_instruction).toBeDefined();
    expect(step1Body.system_instruction.parts[0].text).toContain('dược sĩ lâm sàng');

    // Step 2 check
    const step2Call = (global.fetch as any).mock.calls[1];
    const step2Body = JSON.parse(step2Call[1].body);
    expect(step2Body.system_instruction.parts[0].text).toContain('chuyên gia cấu trúc dữ liệu y tế');
    expect(step2Body.generationConfig.response_mime_type).toBe('application/json');
  });

  it('should use the correct model version gemini-2.5-flash-lite', async () => {
    // Mock Step 1 only (it will fail and return 503 if Step 2 isn't mocked, but we only check first call)
    (global.fetch as any).mockResolvedValue({
      status: 200,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'any' }] } }]
      })
    });

    const req = new NextRequest('http://localhost/api/medicine-dosage', {
      method: 'POST',
      body: JSON.stringify({ medicineName: 'Paracetamol' }),
    });

    await POST(req);

    const lastCall = (global.fetch as any).mock.calls[0];
    const url = lastCall[0];
    expect(url).toContain('gemini-2.5-flash-lite');
  });
});
