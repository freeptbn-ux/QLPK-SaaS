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
  weight: z.string()
    .min(1, 'Vui lòng nhập cân nặng')
    .refine(val => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, 'Cân nặng phải là số lớn hơn 0')
    .refine(val => {
      const num = parseFloat(val);
      return num >= 0.1 && num <= 500;
    }, 'Cân nặng phải từ 0.1 đến 500 kg'),
});

export const updatePrescriptionSchema = z.object({
  prescription_id: z.number().int().positive(),
  patient_id: z.number().int().positive(),
  diagnosis: z.string().min(1, 'Vui lòng nhập chẩn đoán'),
  items: z.array(prescriptionItemSchema).min(1, 'Cần ít nhất 1 loại thuốc'),
  notes: z.string().optional().default(''),
  prescription_date: z.string().min(1, 'Vui lòng chọn ngày kê đơn'),
});

export type ValidatedUpdatePrescriptionData = z.infer<typeof updatePrescriptionSchema>;
export type ValidatedPrescriptionData = z.infer<typeof createPrescriptionSchema>;
export type ValidatedPrescriptionItem = z.infer<typeof prescriptionItemSchema>;
