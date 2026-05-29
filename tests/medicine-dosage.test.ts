import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/medicine-dosage/route';
import { NextRequest } from 'next/server';

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

describe('Medicine Dosage API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset env
    process.env.GEMINI_API_KEYS = 'key1,key2';
    // Mock fetch
    global.fetch = vi.fn();
  });

  it('should return 400 if medicineName is missing', async () => {
    const req = new NextRequest('http://localhost/api/medicine-dosage', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Tên thuốc không hợp lệ');
  });

  it('should return 400 if medicineName is too long', async () => {
    const req = new NextRequest('http://localhost/api/medicine-dosage', {
      method: 'POST',
      body: JSON.stringify({ medicineName: 'a'.repeat(201) }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Tên thuốc quá dài (tối đa 200 ký tự)');
  });

  it('should return 500 if GEMINI_API_KEYS is missing', async () => {
    process.env.GEMINI_API_KEYS = '';
    const req = new NextRequest('http://localhost/api/medicine-dosage', {
      method: 'POST',
      body: JSON.stringify({ medicineName: 'Atersin' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Dịch vụ chưa được cấu hình API key');
  });

  it('should rotate keys if the first one fails with 429', async () => {
    process.env.GEMINI_API_KEYS = 'key1,key2';
    
    // First call returns 429, second returns 200
    (global.fetch as any)
      .mockResolvedValueOnce({
        status: 429,
        json: async () => ({ error: 'Rate limit' }),
      })
      .mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'Dosage info' }] } }],
        }),
      });

    const req = new NextRequest('http://localhost/api/medicine-dosage', {
      method: 'POST',
      body: JSON.stringify({ medicineName: 'Atersin' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.dosageInfo).toBe('Dosage info');
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should fail if all keys return 429', async () => {
    process.env.GEMINI_API_KEYS = 'key1,key2';
    
    (global.fetch as any).mockResolvedValue({
      status: 429,
      json: async () => ({ error: 'Rate limit' }),
    });

    const req = new NextRequest('http://localhost/api/medicine-dosage', {
      method: 'POST',
      body: JSON.stringify({ medicineName: 'Atersin' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(503);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Tất cả API key đều thất bại hoặc bị giới hạn lượt dùng');
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
