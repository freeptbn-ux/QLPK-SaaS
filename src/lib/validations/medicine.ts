import { z } from 'zod';

export const medicineFormSchema = z.object({
  name: z.string().min(1, 'Tên thuốc không được để trống'),
  packing_spec: z.string().optional().default(''),
  price: z.number().nonnegative('Giá phải >= 0'),
  stock_quantity: z.number().int().optional(), // Cho phép âm theo business rule
  min_stock_level: z.number().int().nonnegative().optional(),
  usage_instructions: z.string().optional().default(''),
});

export type ValidatedMedicineData = z.infer<typeof medicineFormSchema>;
