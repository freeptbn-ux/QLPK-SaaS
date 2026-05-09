'use server';

import { getAuthUser } from '@/lib/supabase/auth';
import { Medicine } from '@/types/database';
import { medicineFormSchema, stockAdjustmentSchema } from '@/lib/validations/medicine';
import { formatZodError } from '@/lib/validations/helpers';
import { revalidatePath, cache } from 'next/cache';
import { cache as reactCache } from 'react';
import { getGenericErrorMessage } from '@/lib/error-handler';

export const getAllMedicines = reactCache(async (params?: { page?: number; limit?: number; search?: string }) => {
  const { supabase } = await getAuthUser();
  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const search = params?.search || '';

  let query = supabase
    .from('medicines')
    .select('id, name, packing_spec, price, stock_quantity, min_stock_level', { count: 'exact' })
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
  const { supabase } = await getAuthUser();

  // Validate and whitelist
  const validation = medicineFormSchema.safeParse(rawData);
  if (!validation.success) {
    throw new Error(formatZodError(validation.error));
  }
  const data = validation.data;

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
  const { supabase } = await getAuthUser();

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
    .select()
    .single();

  if (error) {
    throw new Error(getGenericErrorMessage(error));
  }

  revalidatePath('/medicines');
  return updatedData;
}

export async function deleteMedicine(id: number) {
  const { supabase } = await getAuthUser();

  // Check if medicine is in use
  const inUse = await isMedicineInUse(id);
  if (inUse) {
    throw new Error('Thuốc đang được sử dụng trong đơn thuốc, không thể xóa');
  }

  const { error } = await supabase
    .from('medicines')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(getGenericErrorMessage(error));
  }

  revalidatePath('/medicines');
  return { success: true };
}

export async function updateMedicineStock(id: number, adjustment: number, reason?: string) {
  const { supabase } = await getAuthUser();

  // Validate
  const validation = stockAdjustmentSchema.safeParse({ id, adjustment, reason });
  if (!validation.success) {
    throw new Error(formatZodError(validation.error));
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

export const getLowStockMedicines = reactCache(async () => {
  const { supabase } = await getAuthUser();

  // medicines where stock_quantity <= min_stock_level
  const { data, error } = await supabase
    .rpc('get_low_stock_medicines'); 
    
  // If RPC is not available, we can use a standard query
  // But standard query with column comparison might be tricky in Supabase JS without raw SQL
  // Alternative: Fetch all and filter, or use filter operator if supported
  
  if (error) {
     // Fallback to JS filtering if RPC fails or is not defined
     const { data: allMedicines, error: fetchError } = await supabase
        .from('medicines')
        .select('id, name, packing_spec, price, stock_quantity, min_stock_level');
        
     if (fetchError) throw fetchError;
     
     return (allMedicines as Medicine[]).filter(m => m.stock_quantity <= m.min_stock_level);
  }

  return data as Medicine[];
});

export async function isMedicineInUse(id: number): Promise<boolean> {
  const { supabase } = await getAuthUser();

  const { count, error } = await supabase
    .from('prescription_details')
    .select('*', { count: 'exact', head: true })
    .eq('medicine_id', id);

  if (error) {
    console.error('Error checking if medicine is in use:', error);
    return true; // Assume in use to be safe
  }

  return (count || 0) > 0;
}
export async function getMedicines(query: string) {
  const { supabase } = await getAuthUser();

  let q = supabase
    .from('medicines')
    .select('id, name, packing_spec, price, stock_quantity, min_stock_level')
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
  const { supabase } = await getAuthUser();
  
  const { data, error } = await supabase
    .from('medicines')
    .select('id, name, stock_quantity')
    .in('id', ids);

  if (error) {
    console.error('Error fetching medicine stock:', error);
    return [];
  }
  return data;
}
