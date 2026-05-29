import { describe, it, expect } from 'vitest';
import { escapeLikePattern } from '../string';

describe('escapeLikePattern', () => {
  it('should escape %', () => {
    expect(escapeLikePattern('100%')).toBe('100\\%');
  });

  it('should escape _', () => {
    expect(escapeLikePattern('test_user')).toBe('test\\_user');
  });

  it('should escape \\', () => {
    expect(escapeLikePattern('path\\to\\file')).toBe('path\\\\to\\\\file');
  });

  it('should handle empty string', () => {
    expect(escapeLikePattern('')).toBe('');
  });

  it('should handle null/undefined as empty string (if typed correctly, but we handle it)', () => {
    expect(escapeLikePattern(null as any)).toBe('');
  });

  it('should escape combined special characters', () => {
    expect(escapeLikePattern('%_\\')).toBe('\\%\\_\\\\');
  });
});
