'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface MedicineDosageData {
  medicine_name: string;
  adult_dosage: string;
  children_dosage: string;
  usage_instructions: string;
  description: string;
}

interface UseMedicineDosageProps {
  medicineName: string | null;
  cache: React.MutableRefObject<Map<string, MedicineDosageData>>;
}

export function useMedicineDosage({ medicineName, cache }: UseMedicineDosageProps) {
  const [data, setData] = useState<MedicineDosageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedName = useRef<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const sanitizeName = (name: string) => {
    // Chỉ giữ lại chữ cái, số, khoảng trắng và một số ký tự thông dụng trong tên thuốc
    return name.replace(/[^a-zA-Z0-9\s\+\-\/\(\)]/g, '').trim();
  };

  const fetchDosage = useCallback(async (name: string) => {
    const cleanName = sanitizeName(name);
    if (!cleanName) return;

    // Tránh gọi lại nếu đang load chính thuốc đó
    if (isLoading && lastFetchedName.current === cleanName) return;

    // 1. Check cache
    if (cache.current.has(cleanName)) {
      setData(cache.current.get(cleanName)!);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Abort previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    lastFetchedName.current = cleanName;

    try {
      const response = await fetch('/api/medicine-dosage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ medicineName: cleanName }),
        signal: abortControllerRef.current.signal,
      });

      const result = await response.json();

      if (!response.ok) {
        // Xử lý các mã lỗi cụ thể theo plan
        if (response.status === 503) {
          throw new Error('Dịch vụ đang bận, vui lòng thử lại sau (Rate limit)');
        }
        throw new Error(result.error || 'Có lỗi xảy ra khi tra cứu');
      }

      const dosageData = result.data;
      if (!dosageData || !dosageData.medicine_name) {
        throw new Error('Không tìm thấy thông tin liều dùng cho thuốc này');
      }

      // 5. Lưu vào cache
      cache.current.set(cleanName, dosageData);
      setData(dosageData);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      
      console.error('Fetch error:', err);
      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        setError('Lỗi kết nối mạng. Vui lòng kiểm tra internet.');
      } else {
        setError(err.message || 'Có lỗi xảy ra khi tra cứu liều dùng');
      }
    } finally {
      setIsLoading(false);
    }
  }, [cache, isLoading]);

  useEffect(() => {
    if (medicineName) {
      // Debounce nhẹ để tránh double-click nhanh
      const timer = setTimeout(() => {
        fetchDosage(medicineName);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setData(null);
      setIsLoading(false);
      setError(null);
      lastFetchedName.current = null;
    }
  }, [medicineName, fetchDosage]);

  return { data, isLoading, error };
}
