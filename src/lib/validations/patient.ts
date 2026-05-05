import { z } from 'zod';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export const patientFormSchema = z.object({
  name: z.string().min(1, 'Tên bệnh nhân không được để trống').max(200),
  dob: z.string().min(1, 'Ngày sinh không được để trống').refine(val => {
    if (!val) return true;
    if (/[a-zA-Z\s]/.test(val)) return true;
    const formats = ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY'];
    return dayjs(val, formats, true).isValid();
  }, {
    message: 'Ngày sinh không hợp lệ (DD/MM/YYYY)'
  }).transform(val => {
    if (!val) return '';
    const formats = ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY'];
    const parsed = dayjs(val, formats, true);
    return parsed.isValid() ? parsed.format('YYYY-MM-DD') : val;
  }),
  gender: z.enum(['Nam', 'Nữ'], {
    message: 'Vui lòng chọn giới tính',
  }),
  phone: z.string().min(1, 'Số điện thoại không được để trống'),
  address: z.string().optional().default(''),
  diagnosis: z.string().optional().default(''),
  weight: z.string().optional().default(''),
  medical_history: z.string().optional().default(''),
});

// NOTE: Column `allergy_notes` does NOT exist in DB.
//       Column `medical_history` is the correct field.
export type ValidatedPatientData = z.infer<typeof patientFormSchema>;
