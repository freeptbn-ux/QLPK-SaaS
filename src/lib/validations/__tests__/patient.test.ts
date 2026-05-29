import { describe, it, expect } from 'vitest';
import { patientFormSchema as patientSchema } from '../patient';

describe('patientSchema', () => {
  it('should fail when name is empty', () => {
    const result = patientSchema.safeParse({
      name: '',
      dob: '01/01/1990',
      gender: 'Nam',
      phone: '0123456789'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Tên bệnh nhân không được để trống');
    }
  });

  it('should fail when dob is empty', () => {
    const result = patientSchema.safeParse({
      name: 'Nguyễn Văn A',
      dob: '',
      gender: 'Nam',
      phone: '0123456789'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const dobIssue = result.error.issues.find(i => i.path.includes('dob'));
      expect(dobIssue?.message).toBe('Ngày sinh không được để trống');
    }
  });

  it('should fail when gender is missing', () => {
    const result = patientSchema.safeParse({
      name: 'Nguyễn Văn A',
      dob: '01/01/1990',
      phone: '0123456789'
    });
    expect(result.success).toBe(false);
    // When missing, it returns standard Zod error for enum
  });

  it('should fail when phone is empty', () => {
    const result = patientSchema.safeParse({
      name: 'Nguyễn Văn A',
      dob: '01/01/1990',
      gender: 'Nam',
      phone: ''
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const phoneIssue = result.error.issues.find(i => i.path.includes('phone'));
      expect(phoneIssue?.message).toBe('Số điện thoại không được để trống');
    }
  });

  it('should fail with invalid dob format', () => {
    const result = patientSchema.safeParse({
      name: 'Nguyễn Văn A',
      dob: '1/1/90',
      gender: 'Nam',
      phone: '0123456789'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const dobIssue = result.error.issues.find(i => i.path.includes('dob'));
      expect(dobIssue?.message).toBe('Ngày sinh không hợp lệ (DD/MM/YYYY)');
    }
  });

  it('should succeed when all mandatory fields are valid', () => {
    const result = patientSchema.safeParse({
      name: 'Nguyễn Văn A',
      dob: '01/01/1990',
      gender: 'Nam',
      phone: '0123456789'
    });
    expect(result.success).toBe(true);
  });
});
