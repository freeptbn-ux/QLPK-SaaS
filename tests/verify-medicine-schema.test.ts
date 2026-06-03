import { describe, it, expect } from 'vitest';
import { medicineFormSchema } from '../src/lib/validations/medicine';

describe('medicineFormSchema validation', () => {
  it('should successfully validate medicine data without usage_instructions', () => {
    const validData = {
      name: 'Augbidil 500mg',
      packing_spec: 'Hộp 12 gói',
      price: 67,
      min_stock_level: 5,
    };

    const result = medicineFormSchema.safeParse(validData);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        name: 'Augbidil 500mg',
        packing_spec: 'Hộp 12 gói',
        price: 67,
        min_stock_level: 5,
      });
      // Ensure usage_instructions is NOT present in the validated data
      expect(result.data).not.toHaveProperty('usage_instructions');
    }
  });

  it('should reject invalid values', () => {
    const invalidData = {
      name: '', // should not be empty
      price: -10, // should be non-negative
    };

    const result = medicineFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
