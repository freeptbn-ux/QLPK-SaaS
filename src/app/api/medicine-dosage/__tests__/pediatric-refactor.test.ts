import { POST } from '../route';
import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAuthUser } from '@/lib/supabase/auth';

vi.mock('@/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

describe('Pediatric Prompt Refactoring Tests', () => {
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

  it('should include pediatric age groups in Step 1 prompt', async () => {
    let capturedBody: any;
    (global.fetch as any).mockImplementation(async (url: string, options: any) => {
      const body = JSON.parse(options.body);
      if (body.tools && body.tools[0].google_search) {
        capturedBody = body;
        return {
          status: 200,
          json: async () => ({
            candidates: [{ content: { parts: [{ text: 'Step 1 success' }] } }]
          })
        };
      }
      return {
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: JSON.stringify({
            medicine_name: "Test",
            adult_dosage: "1",
            children_dosage: "1",
            usage_instructions: "1",
            description: "1",
            contraindications: "1",
            side_effects: "1"
          }) }] } }]
        })
      };
    });

    const req = new NextRequest('http://localhost/api/medicine-dosage', {
      method: 'POST',
      body: JSON.stringify({ medicineName: 'Augmentin' }),
    });

    await POST(req);

    const systemPrompt = capturedBody.system_instruction.parts[0].text;
    expect(systemPrompt).toContain('nhi khoa');
    expect(systemPrompt).toContain('Trẻ sơ sinh');
    expect(systemPrompt).toContain('Dưới 1 tuổi');
    expect(systemPrompt).toContain('1-3 tuổi');
    expect(systemPrompt).toContain('mg/kg');
  });

  it('should include formatting rules and few-shot in Step 2 prompt', async () => {
    let step2Body: any;
    (global.fetch as any).mockImplementation(async (url: string, options: any) => {
      const body = JSON.parse(options.body);
      if (body.tools && body.tools[0].google_search) {
        return {
          status: 200,
          json: async () => ({
            candidates: [{ content: { parts: [{ text: 'Raw search data' }] } }]
          })
        };
      }
      step2Body = body;
      return {
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: JSON.stringify({
            medicine_name: "Test",
            adult_dosage: "1",
            children_dosage: "1",
            usage_instructions: "1",
            description: "1",
            contraindications: "1",
            side_effects: "1"
          }) }] } }]
        })
      };
    });

    const req = new NextRequest('http://localhost/api/medicine-dosage', {
      method: 'POST',
      body: JSON.stringify({ medicineName: 'Augmentin' }),
    });

    await POST(req);

    const systemPrompt = step2Body.system_instruction.parts[0].text;
    const userPrompt = step2Body.contents[0].parts[0].text;

    expect(systemPrompt).toContain('dấu "-" cho các mục lớn');
    expect(systemPrompt).toContain('dấu "+" cho chi tiết');
    expect(systemPrompt).toContain('\n'); 

    expect(userPrompt).toContain('Ví dụ định dạng (Few-shot)');
    expect(userPrompt).toContain('medicine_name');
    expect(userPrompt).toContain('contraindications');
    expect(userPrompt).toContain('side_effects');
  });

  it('should correctly process AI response with new formatting rules', async () => {
    const formattedChildrenDosage = "- Trẻ em từ 1-3 tuổi:\n  + Liều dùng: 30mg/kg/ngày.\n  + Chia 2 lần.";
    
    (global.fetch as any)
      .mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'Search data' }] } }]
        })
      })
      .mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: JSON.stringify({
            medicine_name: "Augmentin",
            adult_dosage: "- Người lớn: 625mg x 2 lần/ngày.",
            children_dosage: formattedChildrenDosage,
            usage_instructions: "Uống vào đầu bữa ăn",
            description: "Kháng sinh phổ rộng",
            contraindications: "Tiền sử dị ứng penicillin",
            side_effects: "Tiêu chảy, buồn nôn"
          }) }] } }]
        })
      });

    const req = new NextRequest('http://localhost/api/medicine-dosage', {
      method: 'POST',
      body: JSON.stringify({ medicineName: 'Augmentin' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.children_dosage).toBe(formattedChildrenDosage);
    expect(data.data.children_dosage).toContain('\n');
    expect(data.data.children_dosage).toContain('-');
    expect(data.data.children_dosage).toContain('+');
  });
});
