import { z } from 'zod';

export const medicineFormSchema = z.object({
  name: z.string().min(1, 'Tên thuốc không được để trống'),
  packing_spec: z.string().optional().default(''),
  price: z.number().nonnegative('Giá phải >= 0'),
  stock_quantity: z.number().int().optional(),
  min_stock_level: z.number().int().nonnegative().optional(),
});

export const stockAdjustmentSchema = z.object({
  id: z.number(),
  adjustment: z.number(),
  reason: z.string().optional()
});

export type ValidatedMedicineData = z.infer<typeof medicineFormSchema>;

export const medicineDosageSchema = z.object({
  medicineName: z.string()
    .min(2, 'Tên thuốc phải có ít nhất 2 ký tự')
    .max(50, 'Tên thuốc không được vượt quá 50 ký tự')
    .regex(/^[a-zA-Z0-9\sÀ-ỹ\-+]+$/, 'Tên thuốc chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu cộng')
    .refine(val => {
      const blacklist = ['ignore', 'system', 'instruction'];
      return !blacklist.some(word => val.toLowerCase().includes(word));
    }, 'Tên thuốc chứa từ khóa không hợp lệ')
});

export const medicineDosageOutputSchema = z.object({
  medicine_name: z.string(),
  adult_dosage: z.string(),
  children_dosage: z.string(), // Sẽ chứa thông tin chia theo nhóm tuổi nhi khoa
  usage_instructions: z.string(),
  description: z.string(),
  contraindications: z.string(),
  side_effects: z.string(),
});

export const medicineAliasItemSchema = z.object({
  raw_name: z.string().trim().min(1, 'Tên gốc không được để trống'),
  medicine_id: z.number().int().positive('ID thuốc không hợp lệ'),
});

export const medicineAliasesBatchSchema = z.array(medicineAliasItemSchema);

export const batchStockAdjustmentItemSchema = z.object({
  medicine_id: z.number().int().positive('ID thuốc không hợp lệ'),
  quantity: z.number().int().positive('Số lượng nhập phải lớn hơn 0'),
});

export const batchNewMedicineItemSchema = z.object({
  name: z.string().trim().min(1, 'Tên thuốc không được để trống'),
  packing_spec: z.string().optional(),
  unit: z.string().optional(),
  price: z.number().nonnegative('Giá phải >= 0').optional(),
  initial_stock: z.number().int().nonnegative('Tồn kho ban đầu không thể âm').default(0),
});

export const importMedicineStockBatchSchema = z.object({
  adjustments: z.array(batchStockAdjustmentItemSchema),
  newMedicines: z.array(batchNewMedicineItemSchema).optional(),
  reason: z.string().optional(),
});


