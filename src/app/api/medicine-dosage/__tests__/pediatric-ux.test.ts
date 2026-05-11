import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/supabase/auth';

vi.mock('@/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

describe('Pediatric UX Testing (Visual & Formatting)', () => {
  const originalEnv = process.env;

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

  it('should return children_dosage with correct hierarchical markers (- and +)', async () => {
    const mockOutput = {
      medicine_name: "ATERsin",
      adult_dosage: "- Người lớn: 10ml x 3 lần/ngày.",
      children_dosage: "- Trẻ em dưới 1 tuổi:\n  + Liều: 2.5ml/lần.\n- Trẻ em 1-3 tuổi:\n  + Liều: 5ml/lần.",
      usage_instructions: "Uống sau ăn",
      description: "Thuốc ho thảo dược",
      contraindications: "Không có",
      side_effects: "Hiếm gặp"
    };

    (global.fetch as any)
      .mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'Search results for ATERsin' }] } }]
        })
      })
      .mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: JSON.stringify(mockOutput) }] } }]
        })
      });

    const req = new NextRequest('http://localhost/api/medicine-dosage', {
      method: 'POST',
      body: JSON.stringify({ medicineName: 'ATERsin' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    
    // Check for hierarchical markers in children_dosage
    expect(data.data.children_dosage).toContain('-');
    expect(data.data.children_dosage).toContain('+');
    
    // Check for newline characters (they should be rendered as real newlines or escaped correctly in string)
    // The Zod schema might normalize them, let's check what the API returns
    expect(data.data.children_dosage).toMatch(/\n/);
    
    // Check if the markers are at the start of lines or indented
    const lines = data.data.children_dosage.split('\n');
    const hasMajorMarker = lines.some((l: string) => l.trim().startsWith('-'));
    const hasMinorMarker = lines.some((l: string) => l.trim().startsWith('+'));
    
    expect(hasMajorMarker).toBe(true);
    expect(hasMinorMarker).toBe(true);
  });
});
