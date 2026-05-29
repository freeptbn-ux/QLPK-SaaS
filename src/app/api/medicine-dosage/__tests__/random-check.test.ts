import { POST } from '../route';
import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAuthUser } from '@/lib/supabase/auth';
import * as dotenv from 'dotenv';

dotenv.config();

vi.mock('@/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

describe('Random Medicine Verification (Ibuprofen)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, ...dotenv.config().parsed };
    (getAuthUser as any).mockResolvedValue({ user: { id: 'test-user' }, supabase: {} });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should format Ibuprofen dosage correctly (not in gold standards)', async () => {
    const req = new NextRequest('http://localhost/api/medicine-dosage', {
      method: 'POST',
      body: JSON.stringify({ medicineName: 'Ibuprofen' }),
    });

    console.log('Calling Gemini API for Ibuprofen (Live check)...');
    const response = await POST(req);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    
    console.log('\n--- Ibuprofen Children Dosage (RANDOM TEST) ---');
    console.log(data.data.children_dosage);
    console.log('-----------------------------------------------\n');

    expect(data.data.children_dosage).toContain('-');
    expect(data.data.children_dosage).toContain('+');
    expect(data.data.children_dosage).toContain('\n');
  }, 60000);
});
