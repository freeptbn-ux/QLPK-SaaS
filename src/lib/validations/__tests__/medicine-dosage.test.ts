import { describe, it, expect } from 'vitest';
import { medicineDosageSchema, medicineDosageOutputSchema } from '../medicine';

describe('medicineDosageSchema', () => {
  it('should PASS for valid medicine names including +', () => {
    const validNames = ['Paracetamol', 'Panadol', 'Vitamin C', 'Efferalgan-500', 'Hapacol+'];
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
        expect(result.error.issues[0].message).toBe('Tên thuốc chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu cộng');
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

describe('medicineDosageOutputSchema', () => {
  it('should PASS for a valid output structure with newlines and special characters', () => {
    const validOutput = {
      medicine_name: 'Hapacol+',
      adult_dosage: '- 500mg - 1000mg mỗi 4 - 6 giờ.\n- Không quá 4000mg/ngày.',
      children_dosage: '- Liều 10-15mg/kg/liều.\n- Sơ sinh: theo chỉ định.',
      usage_instructions: 'Hòa tan vào nước.\nUống khi sốt.',
      description: 'Thuốc hạ sốt.',
      contraindications: 'Dị ứng paracetamol.',
      side_effects: 'Hiếm gặp: phát ban.'
    };
    const result = medicineDosageOutputSchema.safeParse(validOutput);
    expect(result.success).toBe(true);
  });

  it('should FAIL if missing required expanded fields', () => {
    const invalidOutput = {
      medicine_name: 'Hapacol',
      adult_dosage: '...',
      children_dosage: '...',
      usage_instructions: '...',
      description: '...'
    };
    const result = medicineDosageOutputSchema.safeParse(invalidOutput);
    expect(result.success).toBe(false);
  });
});
