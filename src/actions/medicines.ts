'use server';

import { createClient } from '@/lib/supabase/server';
import { Medicine } from '@/types/database';
import { medicineFormSchema, stockAdjustmentSchema } from '@/lib/validations/medicine';
import { formatZodError } from '@/lib/validations/helpers';
import { revalidatePath } from 'next/cache';
import { getGenericErrorMessage } from '@/lib/error-handler';

export async function getAllMedicines() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(getGenericErrorMessage(error));
  }

  return data as Medicine[];
}

export async function addMedicine(rawData: unknown) {
  const supabase = await createClient();

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
  const supabase = await createClient();

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
  const supabase = await createClient();

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
  const supabase = await createClient();

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

export async function getLowStockMedicines() {
  const supabase = await createClient();

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
        .select('*');
        
     if (fetchError) throw fetchError;
     
     return (allMedicines as Medicine[]).filter(m => m.stock_quantity <= m.min_stock_level);
  }

  return data as Medicine[];
}

export async function isMedicineInUse(id: number): Promise<boolean> {
  const supabase = await createClient();

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
  const supabase = await createClient();

  let q = supabase
    .from('medicines')
    .select('*')
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
  const supabase = await createClient();
  
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
