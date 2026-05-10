import { describe, it, expect } from 'vitest';
import { createPrescriptionSchema } from '../prescription';

describe('createPrescriptionSchema weight validation', () => {
  const validBase = {
    patient_id: 1,
    diagnosis: 'Cảm cúm',
    items: [
      {
        medicine_id: 1,
        medicine_name: 'Paracetamol',
        packing_spec: 'Hộp 10 viên',
        quantity: 10,
        unit_price: 1000
      }
    ],
    consultation_fee: 50000,
  };

  it('should pass with a valid weight', () => {
    const result = createPrescriptionSchema.safeParse({ ...validBase, weight: '65' });
    expect(result.success).toBe(true);
  });

  it('should pass with a valid decimal weight', () => {
    const result = createPrescriptionSchema.safeParse({ ...validBase, weight: '3.5' });
    expect(result.success).toBe(true);
  });

  it('should fail with an empty weight', () => {
    const result = createPrescriptionSchema.safeParse({ ...validBase, weight: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Vui lòng nhập cân nặng');
    }
  });

  it('should fail with missing weight', () => {
    const result = createPrescriptionSchema.safeParse({ ...validBase });
    expect(result.success).toBe(false);
  });

  it('should fail with zero weight', () => {
    const result = createPrescriptionSchema.safeParse({ ...validBase, weight: '0' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Cân nặng phải là số lớn hơn 0');
    }
  });

  it('should fail with negative weight', () => {
    const result = createPrescriptionSchema.safeParse({ ...validBase, weight: '-10' });
    expect(result.success).toBe(false);
  });

  it('should fail with non-numeric weight', () => {
    const result = createPrescriptionSchema.safeParse({ ...validBase, weight: 'abc' });
    expect(result.success).toBe(false);
  });

  it('should fail with weight too large', () => {
    const result = createPrescriptionSchema.safeParse({ ...validBase, weight: '501' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Cân nặng phải từ 0.1 đến 500 kg');
    }
  });

  it('should pass with minimum weight (0.1)', () => {
    const result = createPrescriptionSchema.safeParse({ ...validBase, weight: '0.1' });
    expect(result.success).toBe(true);
  });

  it('should pass with maximum weight (500)', () => {
    const result = createPrescriptionSchema.safeParse({ ...validBase, weight: '500' });
    expect(result.success).toBe(true);
  });
});
