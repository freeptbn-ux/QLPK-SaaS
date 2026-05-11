import { POST } from '../route';
import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAuthUser } from '@/lib/supabase/auth';

vi.mock('@/lib/supabase/auth', () => ({
  getAuthUser: vi.fn(),
}));

describe('POST /api/medicine-dosage - Output Schema', () => {
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

  it('should correctly parse and validate structured JSON output from Gemini', async () => {
    const mockResponse = {
      medicine_name: "Paracetamol",
      adult_dosage: "500mg-1000mg mỗi 4-6 giờ",
      children_dosage: "10-15mg/kg mỗi 4-6 giờ",
      usage_instructions: "Uống sau khi ăn",
      description: "Thuốc giảm đau, hạ sốt phổ biến",
      contraindications: "Mẫn cảm với thành phần thuốc",
      side_effects: "Ít gặp phát ban, buồn nôn"
    };

    (global.fetch as any).mockResolvedValue({
      status: 200,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify(mockResponse)
            }]
          }
        }]
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
    expect(data.data).toEqual(mockResponse);
  });

  it('should throw error if Gemini returns invalid JSON structure', async () => {
    (global.fetch as any).mockResolvedValue({
      status: 200,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{
              text: "Đây không phải là JSON"
            }]
          }
        }]
      })
    });

    const req = new NextRequest('http://localhost/api/medicine-dosage', {
      method: 'POST',
      body: JSON.stringify({ medicineName: 'Paracetamol' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(data.success).toBe(false);
    expect(data.error).toBe('Dữ liệu từ AI không đúng định dạng chuẩn');
  });

  it('should throw error if Gemini returns JSON but missing required fields', async () => {
    const invalidResponse = {
      medicine_name: "Paracetamol"
      // missing other fields
    };

    (global.fetch as any).mockResolvedValue({
      status: 200,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify(invalidResponse)
            }]
          }
        }]
      })
    });

    const req = new NextRequest('http://localhost/api/medicine-dosage', {
      method: 'POST',
      body: JSON.stringify({ medicineName: 'Paracetamol' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(data.success).toBe(false);
    expect(data.error).toBe('Dữ liệu từ AI không đúng định dạng chuẩn');
  });
});
