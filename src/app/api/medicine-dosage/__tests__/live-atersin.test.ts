import { POST } from '../route';
import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAuthUser } from '@/lib/supabase/auth';

import * as dotenv from 'dotenv';

// Load env variables
dotenv.config();

vi.mock('@/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

// This test uses the real API (no fetch mock)
describe('Live ATERsin Verification', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Ensure API keys are present in process.env for the test
    process.env = { ...originalEnv, ...dotenv.config().parsed };
    (getAuthUser as any).mockResolvedValue({ user: { id: 'test-user' }, supabase: {} });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return real dosage for ATERsin from Gemini', async () => {
    // Increase timeout for real API call
    const req = new NextRequest('http://localhost/api/medicine-dosage', {
      method: 'POST',
      body: JSON.stringify({ medicineName: 'ATERsin' }),
    });

    console.log('Calling Gemini API for ATERsin...');
    const response = await POST(req);
    const data = await response.json();

    console.log('Response Status:', response.status);
    if (!data.success) {
      console.error('API Error:', data.error);
    }
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.medicine_name).toContain('ATERsin');
    
    console.log('\n--- ATERsin Children Dosage ---');
    console.log(data.data.children_dosage);
    console.log('-------------------------------\n');

    expect(data.data.children_dosage).toContain('-');
    expect(data.data.children_dosage).toContain('+');
    expect(data.data.children_dosage).toContain('\n');
  }, 60000); // 60s timeout for live API
});
