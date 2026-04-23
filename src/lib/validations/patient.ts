import { z } from 'zod';

export const patientSchema = z.object({
  name: z.string().min(1, 'Tên bệnh nhân không được để trống'),
  dob: z.string().optional(),
  gender: z.enum(['Nam', 'Nữ', '']).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  weight: z.string().optional(),
  diagnosis: z.string().optional(),
});

export type PatientSchemaType = z.infer<typeof patientSchema>;
