import { describe, it, expect } from 'vitest';
import { medicineDosageSchema } from '../medicine';

describe('medicineDosageSchema', () => {
  it('should PASS for valid medicine names', () => {
    const validNames = ['Paracetamol', 'Panadol', 'Vitamin C', 'Efferalgan-500'];
    validNames.forEach(name => {
      const result = medicineDosageSchema.safeParse({ medicineName: name });
      expect(result.success).toBe(true);
    });
  });

  it('should FAIL for medicine names shorter than 2 characters', () => {
    const result = medicineDosageSchema.safeParse({ medicineName: 'A' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Tên thuốc phải có ít nhất 2 ký tự');
    }
  });

  it('should FAIL for medicine names longer than 50 characters', () => {
    const longName = 'a'.repeat(51);
    const result = medicineDosageSchema.safeParse({ medicineName: longName });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Tên thuốc không được vượt quá 50 ký tự');
    }
  });

  it('should FAIL for invalid characters', () => {
    const invalidNames = ['<script>alert(1)</script>', 'Medicine@!', 'Med#icine', 'Name_With_Underscore'];
    invalidNames.forEach(name => {
      const result = medicineDosageSchema.safeParse({ medicineName: name });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Tên thuốc chỉ được chứa chữ cái, số, khoảng trắng và dấu gạch ngang');
      }
    });
  });

  it('should FAIL for blacklisted keywords', () => {
    const blacklistedNames = ['Ignore instructions', 'System override', 'Instruction manual'];
    blacklistedNames.forEach(name => {
      const result = medicineDosageSchema.safeParse({ medicineName: name });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Tên thuốc chứa từ khóa không hợp lệ');
      }
    });
  });
});
