import { describe, it, expect } from 'vitest';
import { medicineFormSchema } from '../src/lib/validations/medicine';

describe('Phase 01: Decimal Price Validation Schema', () => {
  it('Test 1: Valid integer 5 passes validation', () => {
    const result = medicineFormSchema.safeParse({
      name: 'Thuốc A',
      price: 5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(5);
    }
  });

  it('Test 2: Valid float 4.7 passes validation', () => {
    const result = medicineFormSchema.safeParse({
      name: 'Thuốc B',
      price: 4.7,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(4.7);
    }
  });

  it('Test 3: String "4,7" is normalized to 4.7 and passes validation', () => {
    const result = medicineFormSchema.safeParse({
      name: 'Thuốc C',
      price: '4,7',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(4.7);
    }
  });

  it('Test 4: Negative price -10 fails validation', () => {
    const result = medicineFormSchema.safeParse({
      name: 'Thuốc D',
      price: -10,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('price'));
      expect(issue).toBeDefined();
      expect(issue?.message).toBe('Giá phải >= 0');
    }

    const stringNegativeResult = medicineFormSchema.safeParse({
      name: 'Thuốc D',
      price: '-10',
    });
    expect(stringNegativeResult.success).toBe(false);
    if (!stringNegativeResult.success) {
      const issue = stringNegativeResult.error.issues.find((i) => i.path.includes('price'));
      expect(issue).toBeDefined();
      expect(issue?.message).toBe('Giá phải >= 0');
    }
  });

  it('Test 5: Invalid string "abc" fails validation', () => {
    const result = medicineFormSchema.safeParse({
      name: 'Thuốc E',
      price: 'abc',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('price'));
      expect(issue).toBeDefined();
    }
  });
});
