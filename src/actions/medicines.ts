'use server';

import { getAuthUser } from '@/lib/supabase/auth';
import { Medicine } from '@/types/database';
import { medicineFormSchema, stockAdjustmentSchema } from '@/lib/validations/medicine';
import { formatZodError } from '@/lib/validations/helpers';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';
import { getGenericErrorMessage } from '@/lib/error-handler';

export const getAllMedicines = cache(async (params?: { page?: number; limit?: number; search?: string }) => {
  const { user, supabase, clinicId } = await getAuthUser();

  if (!clinicId) {
    throw new Error('Không tìm thấy thông tin phòng khám. Vui lòng đăng nhập lại.');
  }

  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const search = params?.search || '';

  let query = supabase
    .from('medicines')
    .select('id, name, packing_spec, price, stock_quantity, min_stock_level', { count: 'exact' })
    .eq('clinic_id', clinicId)
    .order('name', { ascending: true });

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(getGenericErrorMessage(error));
  }

  return {
    data: data as Medicine[],
    count: count || 0,
    page,
    limit
  };
});

export async function addMedicine(rawData: unknown) {
  const { user, supabase, clinicId } = await getAuthUser();

  if (!clinicId) {
    throw new Error('Không tìm thấy thông tin phòng khám.');
  }

  // Validate and whitelist
  const validation = medicineFormSchema.safeParse(rawData);
  if (!validation.success) {
    throw new Error(formatZodError(validation.error));
  }
  const data = { ...validation.data, clinic_id: clinicId };

  const { data: insertedData, error } = await supabase
    .from('medicines')
    .insert([data])
    .select()
    .single();

  if (error) {
    throw new Error(getGenericErrorMessage(error));
  }

  revalidatePath('/medicines');
  return insertedData;
}

export async function updateMedicine(id: number, rawData: unknown) {
  const { user, supabase, clinicId } = await getAuthUser();

  if (!clinicId) {
    throw new Error('Không tìm thấy thông tin phòng khám.');
  }

  // Validate and whitelist
  const validation = medicineFormSchema.safeParse(rawData);
  if (!validation.success) {
    throw new Error(formatZodError(validation.error));
  }
  const data = validation.data;

  const { data: updatedData, error } = await supabase
    .from('medicines')
    .update(data)
    .eq('id', id)
    .eq('clinic_id', clinicId)
    .select()
    .single();

  if (error) {
    throw new Error(getGenericErrorMessage(error));
  }

  revalidatePath('/medicines');
  return updatedData;
}

export async function deleteMedicine(id: number) {
  const { user, supabase, clinicId } = await getAuthUser();

  if (!clinicId) {
    throw new Error('Không tìm thấy thông tin phòng khám.');
  }

  // Check if medicine is in use
  const inUse = await isMedicineInUse(id);
  if (inUse) {
    throw new Error('Thuốc đang được sử dụng trong đơn thuốc, không thể xóa');
  }

  const { error } = await supabase
    .from('medicines')
    .delete()
    .eq('id', id)
    .eq('clinic_id', clinicId);

  if (error) {
    throw new Error(getGenericErrorMessage(error));
  }

  revalidatePath('/medicines');
  return { success: true };
}

export async function updateMedicineStock(id: number, adjustment: number, reason?: string) {
  const { user, supabase, clinicId } = await getAuthUser();

  if (!clinicId) {
    throw new Error('Không tìm thấy thông tin phòng khám.');
  }

  // Validate
  const validation = stockAdjustmentSchema.safeParse({ id, adjustment, reason });
  if (!validation.success) {
    throw new Error(formatZodError(validation.error));
  }

  // Check if medicine belongs to clinic
  const { data: medicine, error: checkError } = await supabase
    .from('medicines')
    .select('id')
    .eq('id', id)
    .eq('clinic_id', clinicId)
    .single();
    
  if (checkError || !medicine) {
    throw new Error('Không tìm thấy thuốc hoặc bạn không có quyền chỉnh sửa');
  }

  const { data, error } = await supabase.rpc('adjust_medicine_stock', {
    p_medicine_id: id,
    p_adjustment: adjustment,
    p_reason: reason || 'Điều chỉnh thủ công'
  });

  if (error) {
    throw new Error(getGenericErrorMessage(error));
  }

  revalidatePath('/medicines');
  return data;
}

export const getLowStockMedicines = cache(async () => {
  const { supabase, clinicId } = await getAuthUser();

  if (!clinicId) {
    // If no clinic ID, return empty instead of throwing to keep the UI stable
    return [];
  }

  const { data, error } = await supabase.rpc('get_low_stock_medicines', {
    p_clinic_id: clinicId,
  }); 
  
  if (error) {
    throw new Error(getGenericErrorMessage(error));
  }

  return data as Medicine[];
});

export async function isMedicineInUse(id: number): Promise<boolean> {
  const { user, supabase } = await getAuthUser();
  const clinicId = user.user_metadata?.clinic_id;

  if (!clinicId) return false;

  const { count, error } = await supabase
    .from('prescription_details')
    .select('*, prescriptions_header!inner(clinic_id)', { count: 'exact', head: true })
    .eq('medicine_id', id)
    .eq('prescriptions_header.clinic_id', clinicId);

  if (error) {
    console.error('Error checking if medicine is in use:', error);
    return true; // Assume in use to be safe
  }

  return (count || 0) > 0;
}
export async function getMedicines(query: string) {
  const { user, supabase, clinicId } = await getAuthUser();

  if (!clinicId) return [];

  let q = supabase
    .from('medicines')
    .select('id, name, packing_spec, price, stock_quantity, min_stock_level')
    .eq('clinic_id', clinicId)
    .order('name', { ascending: true });

  if (query) {
    q = q.ilike('name', `%${query}%`);
  }

  const { data, error } = await q.limit(20);

  if (error) {
    console.error('Error searching medicines:', error);
    return [];
  }

  return data as Medicine[];
}

export async function getMedicineStockByIds(ids: number[]) {
  const { user, supabase, clinicId } = await getAuthUser();

  if (!clinicId) return [];
  
  const { data, error } = await supabase
    .from('medicines')
    .select('id, name, stock_quantity')
    .eq('clinic_id', clinicId)
    .in('id', ids);

  if (error) {
    console.error('Error fetching medicine stock:', error);
    return [];
  }
  return data;
}
