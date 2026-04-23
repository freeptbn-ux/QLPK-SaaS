import { z } from 'zod';

export const patientSchema = z.object({
  name: z.string().min(1, 'Tên bệnh nhân không được để trống'),
  dob: z.string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true; // Cho phép trống
        // Phải đúng format DD/MM/YYYY
        const regex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!regex.test(val)) return false;
        // Validate ngày hợp lệ
        const [dd, mm, yyyy] = val.split('/').map(Number);
        if (mm < 1 || mm > 12) return false;
        if (dd < 1 || dd > 31) return false;
        if (yyyy < 1900 || yyyy > 2100) return false;
        // Check ngày trong tháng
        const date = new Date(yyyy, mm - 1, dd);
        return date.getDate() === dd && date.getMonth() === mm - 1;
      },
      { message: 'Ngày sinh không hợp lệ (DD/MM/YYYY)' }
    ),
  gender: z.enum(['Nam', 'Nữ', '']).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  weight: z.string().optional(),
  diagnosis: z.string().optional(),
});

export type PatientSchemaType = z.infer<typeof patientSchema>;
