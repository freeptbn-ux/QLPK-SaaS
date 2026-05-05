import { describe, it, expect } from 'vitest';
import { createPrescriptionSchema } from '../src/lib/validations/prescription';

describe('createPrescriptionSchema weight validation', () => {
  const baseData = {
    patient_id: 1,
    diagnosis: 'Sốt xuất huyết',
    items: [
      {
        medicine_id: 1,
        medicine_name: 'Paracetamol',
        packing_spec: 'Vỉ 10 viên',
        quantity: 2,
        unit_price: 5000,
      }
    ],
    consultation_fee: 30000,
  };

  it('should fail if weight is missing', () => {
    const result = createPrescriptionSchema.safeParse({ ...baseData });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(e => e.path.includes('weight'))).toBe(true);
    }
  });

  it('should fail if weight is empty string', () => {
    const result = createPrescriptionSchema.safeParse({ ...baseData, weight: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(e => e.message === 'Vui lòng nhập cân nặng')).toBe(true);
    }
  });

  it('should fail if weight is not a number string', () => {
    const result = createPrescriptionSchema.safeParse({ ...baseData, weight: 'abc' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(e => e.message === 'Cân nặng phải là số lớn hơn 0')).toBe(true);
    }
  });

  it('should fail if weight is 0', () => {
    const result = createPrescriptionSchema.safeParse({ ...baseData, weight: '0' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(e => e.message === 'Cân nặng phải là số lớn hơn 0')).toBe(true);
    }
  });

  it('should fail if weight is negative', () => {
    const result = createPrescriptionSchema.safeParse({ ...baseData, weight: '-5' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(e => e.message === 'Cân nặng phải là số lớn hơn 0')).toBe(true);
    }
  });

  it('should fail if weight is too high (> 500)', () => {
    const result = createPrescriptionSchema.safeParse({ ...baseData, weight: '501' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(e => e.message === 'Cân nặng phải từ 0.1 đến 500 kg')).toBe(true);
    }
  });

  it('should succeed with valid weight (integer)', () => {
    const result = createPrescriptionSchema.safeParse({ ...baseData, weight: '65' });
    expect(result.success).toBe(true);
  });

  it('should succeed with valid weight (decimal)', () => {
    const result = createPrescriptionSchema.safeParse({ ...baseData, weight: '3.5' });
    expect(result.success).toBe(true);
  });
});
