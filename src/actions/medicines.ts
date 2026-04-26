'use server';

import { createClient } from '@/lib/supabase/server';
import { Medicine } from '@/types/database';
import { medicineFormSchema } from '@/lib/validations/medicine';
import { formatZodError } from '@/lib/validations/helpers';
import { revalidatePath } from 'next/cache';

export async function getAllMedicines() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching medicines:', error);
    throw new Error('Failed to fetch medicines');
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
    console.error('Error adding medicine:', error);
    if (error.code === '23505') {
      throw new Error('Tên thuốc đã tồn tại');
    }
    throw new Error('Failed to add medicine');
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
    console.error('Error updating medicine:', error);
    if (error.code === '23505') {
      throw new Error('Tên thuốc đã tồn tại');
    }
    throw new Error('Failed to update medicine');
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
    console.error('Error deleting medicine:', error);
    throw new Error('Failed to delete medicine');
  }

  revalidatePath('/medicines');
  return { success: true };
}

export async function updateMedicineStock(id: number, newQuantity: number) {
  const supabase = await createClient();

  const { data: updatedData, error } = await supabase
    .from('medicines')
    .update({ stock_quantity: newQuantity })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating medicine stock:', error);
    throw new Error('Failed to update medicine stock');
  }

  revalidatePath('/medicines');
  return updatedData;
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
