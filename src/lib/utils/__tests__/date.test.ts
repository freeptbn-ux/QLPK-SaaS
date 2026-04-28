import { describe, it, expect } from 'vitest';
import { formatLastVisit, formatDob } from '../date';

describe('formatLastVisit', () => {
  const now = new Date();
  
  const formatDate = (date: Date) => date.toISOString();

  it('should return "Chưa khám" if date is null or undefined', () => {
    expect(formatLastVisit(null)).toBe('Chưa khám');
    expect(formatLastVisit(undefined)).toBe('Chưa khám');
  });

  it('should return "Hôm nay" if date is today', () => {
    expect(formatLastVisit(formatDate(now))).toBe('Hôm nay');
  });

  it('should return "Hôm qua" if date is yesterday', () => {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    expect(formatLastVisit(formatDate(yesterday))).toBe('Hôm qua');
  });

  it('should return "X ngày trước" if date is within a week', () => {
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(now.getDate() - 3);
    expect(formatLastVisit(formatDate(threeDaysAgo))).toBe('3 ngày trước');
    
    const sixDaysAgo = new Date(now);
    sixDaysAgo.setDate(now.getDate() - 6);
    expect(formatLastVisit(formatDate(sixDaysAgo))).toBe('6 ngày trước');
  });

  it('should return "X tuần trước" if date is within a month', () => {
    const tenDaysAgo = new Date(now);
    tenDaysAgo.setDate(now.getDate() - 10);
    expect(formatLastVisit(formatDate(tenDaysAgo))).toBe('1 tuần trước');
    
    const twentyFiveDaysAgo = new Date(now);
    twentyFiveDaysAgo.setDate(now.getDate() - 25);
    expect(formatLastVisit(formatDate(twentyFiveDaysAgo))).toBe('3 tuần trước');
  });

  it('should return "X tháng trước" if date is within a year', () => {
    const fortyFiveDaysAgo = new Date(now);
    fortyFiveDaysAgo.setDate(now.getDate() - 45);
    expect(formatLastVisit(formatDate(fortyFiveDaysAgo))).toBe('1 tháng trước');
    
    const threeHundredDaysAgo = new Date(now);
    threeHundredDaysAgo.setDate(now.getDate() - 300);
    expect(formatLastVisit(formatDate(threeHundredDaysAgo))).toBe('10 tháng trước');
  });

  it('should return locale date string if date is older than a year', () => {
    const twoYearsAgo = new Date(now);
    twoYearsAgo.setFullYear(now.getFullYear() - 2);
    expect(formatLastVisit(formatDate(twoYearsAgo))).toBe(twoYearsAgo.toLocaleDateString('vi-VN'));
  });
});

describe('formatDob', () => {
  it('should format valid ISO date strings to DD/MM/YYYY', () => {
    expect(formatDob('1990-03-15')).toBe('15/03/1990');
    expect(formatDob('2000-01-01')).toBe('01/01/2000');
  });

  it('should return "N/A" for null or empty string', () => {
    expect(formatDob(null)).toBe('N/A');
    expect(formatDob('')).toBe('N/A');
  });

  it('should return "N/A" for invalid date strings', () => {
    expect(formatDob('invalid')).toBe('N/A');
    expect(formatDob('2024-13-45')).toBe('N/A');
  });
});
