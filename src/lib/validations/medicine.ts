import { z } from 'zod';

export const medicineSchema = z.object({
  name: z.string().min(1, 'Tên thuốc không được để trống'),
  packing_spec: z.string().optional().nullable(),
  price: z.coerce.number().min(0, 'Giá phải ≥ 0'),
  stock_quantity: z.coerce.number().int().min(0, 'Số lượng tồn kho phải ≥ 0'),
  min_stock_level: z.coerce.number().int().min(0, 'Ngưỡng cảnh báo phải ≥ 0'),
});

export type MedicineFormData = z.infer<typeof medicineSchema>;
