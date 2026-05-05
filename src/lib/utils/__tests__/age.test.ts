import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import { formatAge, parseAgeParts, formatDobForInput } from '../age';

describe('age utility', () => {
  const refDate = dayjs('2026-04-23'); // Fixed reference date for tests

  describe('formatAge', () => {
    it('should return "0 ngày tuổi" for newborn (same day)', () => {
      expect(formatAge('23/04/2026', refDate)).toBe('0 ngày tuổi');
    });

    it('should return "3 ngày tuổi" for < 7 days', () => {
      expect(formatAge('20/04/2026', refDate)).toBe('3 ngày tuổi');
    });

    it('should return "1 tuần tuổi" for exactly 7 days', () => {
      expect(formatAge('16/04/2026', refDate)).toBe('1 tuần tuổi');
    });

    it('should return "7 tuần tuổi" for < 2 months', () => {
      expect(formatAge('01/03/2026', refDate)).toBe('7 tuần tuổi');
    });

    it('should return "2 tháng tuổi" for exactly 2 months', () => {
      // 23/02 to 23/04 is 2 months
      expect(formatAge('23/02/2026', refDate)).toBe('2 tháng tuổi');
    });

    it('should return months for age between 2 months and 6 years', () => {
      expect(formatAge('23/10/2025', refDate)).toBe('6 tháng tuổi');
    });

    it('should return "60 tháng tuổi" for exactly 5 years', () => {
      expect(formatAge('23/04/2021', refDate)).toBe('60 tháng tuổi');
    });

    it('should return "71 tháng tuổi" for just under 6 years', () => {
      // 24/04/2020 to 23/04/2026 is 5 years and 364 days (approx)
      // Actually dayjs diff 'month' will give 71
      expect(formatAge('24/04/2020', refDate)).toBe('71 tháng tuổi');
    });

    it('should return "6 tuổi" for exactly 6 years', () => {
      expect(formatAge('23/04/2020', refDate)).toBe('6 tuổi');
    });

    it('should return "30 tuổi" for older patient', () => {
      expect(formatAge('23/04/1996', refDate)).toBe('30 tuổi');
    });

    it('should return empty string for empty input', () => {
      expect(formatAge('')).toBe('');
    });

    it('should return empty string for invalid format', () => {
      expect(formatAge('1990')).toBe('');
      expect(formatAge('12 tháng')).toBe('');
      expect(formatAge('32/01/2000')).toBe('');
    });

    it('should return empty string for future date', () => {
      expect(formatAge('24/04/2026', refDate)).toBe('');
    });

    describe('YYYY-MM-DD format', () => {
      it('should parse ISO format (YYYY-MM-DD)', () => {
        expect(formatAge('2026-04-23', refDate)).toBe('0 ngày tuổi');
      });

      it('should parse ISO format for older patient', () => {
        expect(formatAge('1996-04-23', refDate)).toBe('30 tuổi');
      });

      it('should parse ISO format for infant', () => {
        expect(formatAge('2025-02-16', refDate)).toBe('14 tháng tuổi');
        // Nguyễn Quang Hoàng Đức: 16/02/2025
      });

      it('should still reject invalid ISO dates', () => {
        expect(formatAge('2026-13-01', refDate)).toBe('');
        expect(formatAge('2026-01-32', refDate)).toBe('');
      });

      it('should return correct parts for ISO format', () => {
        const parts = parseAgeParts('2025-02-16', refDate);
        expect(parts).toEqual({ value: 14, unit: 'month' });
      });
    });
  });

  describe('parseAgeParts', () => {
    it('should return correct parts for 7 weeks', () => {
      const parts = parseAgeParts('01/03/2026', refDate);
      expect(parts).toEqual({ value: 7, unit: 'week' });
    });

    it('should return null for invalid DOB', () => {
      expect(parseAgeParts('invalid')).toBeNull();
    });
  });

  describe('formatDobForInput', () => {
    it('should return DD/MM/YYYY for ISO format', () => {
      expect(formatDobForInput('2025-02-16')).toBe('16/02/2025');
    });

    it('should return same string if already DD/MM/YYYY', () => {
      expect(formatDobForInput('16/02/2025')).toBe('16/02/2025');
    });

    it('should return empty string for invalid format', () => {
      expect(formatDobForInput('2025/02/16')).toBe('');
      expect(formatDobForInput('16-02-2025')).toBe('');
      expect(formatDobForInput('')).toBe('');
    });
  });
});
