import { z } from 'zod';

export const patientSchema = z.object({
  name: z.string().min(1, 'Tên bệnh nhân không được để trống'),
  dob: z.string()
    .min(1, 'Ngày sinh không được để trống')
    .refine(
      (val) => {
        if (!val || val === '') return true; // Sẽ bị bắt bởi .min(1) ở trên, nhưng giữ lại refine logic
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
  gender: z.enum(['Nam', 'Nữ']),
  address: z.string().optional(),
  phone: z.string().min(1, 'Số điện thoại không được để trống'),
  weight: z.string().optional(),
  diagnosis: z.string().optional(),
});

export type PatientSchemaType = z.infer<typeof patientSchema>;
