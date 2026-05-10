import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import MedicineAutocomplete from '@/components/features/prescriptions/MedicineAutocomplete';
import { getMedicines } from '@/actions/medicines';
import { getPatientById } from '@/actions/patients';
import { cache } from 'react';

// Mock medicines action
vi.mock('@/actions/medicines', () => ({
  getMedicines: vi.fn().mockResolvedValue([]),
}));

// Mock react's cache to track calls
vi.mock('react', async () => {
  const actual = await vi.importActual('react') as any;
  return {
    ...actual,
    cache: vi.fn((fn) => {
      const cachedFn = (...args: any[]) => fn(...args);
      (cachedFn as any).__isCached = true;
      return cachedFn;
    }),
  };
});

describe('Phase 03 Performance Fixes Verification', () => {
  
  describe('getPatientById Optimization', () => {
    it('should be a cached function', () => {
      // getPatientById should have been wrapped with cache
      expect((getPatientById as any).__isCached).toBe(true);
      expect(cache).toHaveBeenCalled();
    });
  });

  describe('MedicineAutocomplete Debounce & Stability', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.useFakeTimers();
    });

    it('should only call getMedicines once after typing multiple characters (debounce)', async () => {
      const onSelect = vi.fn();
      render(<MedicineAutocomplete onSelect={onSelect} />);
      
      const input = screen.getByPlaceholderText(/nhập tên thuốc/i);
      
      fireEvent.change(input, { target: { value: 'P' } });
      fireEvent.change(input, { target: { value: 'Pa' } });
      fireEvent.change(input, { target: { value: 'Par' } });
      
      // Should not have called yet
      expect(getMedicines).not.toHaveBeenCalled();
      
      // Advance time by 300ms and run pending async tasks
      vi.advanceTimersByTime(300);
      await vi.runAllTimersAsync();
      
      expect(getMedicines).toHaveBeenCalledTimes(1);
      expect(getMedicines).toHaveBeenCalledWith('Par');
    });

    it('should maintain a stable debounced function when excludeIds change', async () => {
      const onSelect = vi.fn();
      const { rerender } = render(<MedicineAutocomplete onSelect={onSelect} excludeIds={[]} />);
      
      const input = screen.getByPlaceholderText(/nhập tên thuốc/i);
      
      // Type something
      fireEvent.change(input, { target: { value: 'P' } });
      
      // Change excludeIds prop
      rerender(<MedicineAutocomplete onSelect={onSelect} excludeIds={[1, 2]} />);
      
      // Change input again
      fireEvent.change(input, { target: { value: 'Pa' } });
      
      // Advance time and run pending async tasks
      vi.advanceTimersByTime(300);
      await vi.runAllTimersAsync();
      
      // If the debounce was reset, it might have called twice or cancelled the first one.
      // But since we type 'P' then 'Pa' within the debounce window, only one call to 'Pa' should happen if stable.
      expect(getMedicines).toHaveBeenCalledTimes(1);
      expect(getMedicines).toHaveBeenCalledWith('Pa');
    });
  });
});
