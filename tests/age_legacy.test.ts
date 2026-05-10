import { describe, it, expect } from 'vitest';
import { parseLegacyAgeGroup } from '../src/lib/utils/age';

describe('parseLegacyAgeGroup', () => {
  it('should parse "25 tuổi" as "Người lớn"', () => {
    expect(parseLegacyAgeGroup('25 tuổi')).toBe('Người lớn');
  });

  it('should parse "7 tháng" as "2-6 tháng"', () => {
    // 7 months > 6 months, so it should be in the next group
    // The logic in age.ts is:
    // if (months <= 2) return '0-2 tháng';
    // if (months <= 6) return '2-6 tháng';
    // if (months <= 24) return '6 tháng-2 tuổi';
    expect(parseLegacyAgeGroup('7 tháng')).toBe('6 tháng-2 tuổi');
  });

  it('should parse "5.5 tuổi" as "2-6 tuổi"', () => {
    // 5.5 * 12 = 66 months.
    // <= 72 months is '2-6 tuổi'
    expect(parseLegacyAgeGroup('5.5 tuổi')).toBe('2-6 tuổi');
  });

  it('should parse "3,5 tuổi" as "2-6 tuổi"', () => {
    // 3.5 * 12 = 42 months.
    expect(parseLegacyAgeGroup('3,5 tuổi')).toBe('2-6 tuổi');
  });

  it('should parse "18 tháng" as "6 tháng-2 tuổi"', () => {
    expect(parseLegacyAgeGroup('18 tháng')).toBe('6 tháng-2 tuổi');
  });

  it('should return null for "không tuổi"', () => {
    expect(parseLegacyAgeGroup('không tuổi')).toBeNull();
  });

  it('should parse "30 tuổi" as "Người lớn"', () => {
    expect(parseLegacyAgeGroup('30 tuổi')).toBe('Người lớn');
  });

  it('should handle "14 tháng" as "6 tháng-2 tuổi"', () => {
    expect(parseLegacyAgeGroup('14 tháng')).toBe('6 tháng-2 tuổi');
  });

  it('should handle "1 tháng" as "0-2 tháng"', () => {
    expect(parseLegacyAgeGroup('1 tháng')).toBe('0-2 tháng');
  });

  it('should handle "3 tháng" as "2-6 tháng"', () => {
    expect(parseLegacyAgeGroup('3 tháng')).toBe('2-6 tháng');
  });

  it('should handle "8 tuổi" as "6-16 tuổi"', () => {
    // 8 * 12 = 96 months. <= 192 is 6-16 tuổi
    expect(parseLegacyAgeGroup('8 tuổi')).toBe('6-16 tuổi');
  });
});
