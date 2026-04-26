import { z } from 'zod';

export const prescriptionItemSchema = z.object({
  medicine_id: z.number().int().positive(),
  medicine_name: z.string(),
  packing_spec: z.string(),
  quantity: z.number().int().positive('Số lượng phải > 0'),
  unit_price: z.number().nonnegative(),
});

export const createPrescriptionSchema = z.object({
  patient_id: z.number().int().positive(),
  diagnosis: z.string().min(1, 'Vui lòng nhập chẩn đoán'),
  items: z.array(prescriptionItemSchema).min(1, 'Cần ít nhất 1 loại thuốc'),
  notes: z.string().optional().default(''),
  consultation_fee: z.number().nonnegative(),
});

export type ValidatedPrescriptionData = z.infer<typeof createPrescriptionSchema>;
export type ValidatedPrescriptionItem = z.infer<typeof prescriptionItemSchema>;
