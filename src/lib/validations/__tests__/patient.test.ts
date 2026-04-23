import { patientSchema } from '../patient';

describe('patientSchema', () => {
  it('should validate a valid patient with DD/MM/YYYY dob', () => {
    const data = {
      name: 'Nguyen Van A',
      dob: '15/06/1990',
      gender: 'Nam',
    };
    const result = patientSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should allow empty dob', () => {
    const data = {
      name: 'Nguyen Van A',
      dob: '',
    };
    const result = patientSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should allow undefined dob', () => {
    const data = {
      name: 'Nguyen Van A',
    };
    const result = patientSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should fail on invalid date format', () => {
    const data = {
      name: 'Nguyen Van A',
      dob: '1990',
    };
    const result = patientSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Ngày sinh không hợp lệ (DD/MM/YYYY)');
    }
  });

  it('should fail on invalid day', () => {
    const data = {
      name: 'Nguyen Van A',
      dob: '32/01/2000',
    };
    const result = patientSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should fail on invalid month', () => {
    const data = {
      name: 'Nguyen Van A',
      dob: '01/13/2000',
    };
    const result = patientSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should fail on invalid leap year date', () => {
    const data = {
      name: 'Nguyen Van A',
      dob: '29/02/2023',
    };
    const result = patientSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should pass on valid leap year date', () => {
    const data = {
      name: 'Nguyen Van A',
      dob: '29/02/2024',
    };
    const result = patientSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should fail on year outside range', () => {
    const data = {
      name: 'Nguyen Van A',
      dob: '01/01/1899',
    };
    const result = patientSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
