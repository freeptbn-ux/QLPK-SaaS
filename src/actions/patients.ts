'use server';

import { createClient } from '@/lib/supabase/server';
import { removeDiacritics } from '@/lib/utils/normalize';
import { PatientFormData } from '@/types/forms';
import { Patient } from '@/types/database';
import { revalidatePath } from 'next/cache';

export async function getPatientsPaginated(page: number, pageSize: number) {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('patients')
    .select('*', { count: 'exact' })
    .order('id', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching patients:', error);
    throw new Error('Failed to fetch patients');
  }

  return { data: data as Patient[], count };
}

export async function searchPatients(term: string, page: number, pageSize: number) {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const normalizedTerm = removeDiacritics(term);

  let query = supabase
    .from('patients')
    .select('*', { count: 'exact' });

  if (term) {
    // Search by normalized name or phone
    query = query.or(`name_normalized.ilike.%${normalizedTerm}%,phone.ilike.%${term}%`);
  }

  const { data, error, count } = await query
    .order('id', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error searching patients:', error);
    throw new Error('Failed to search patients');
  }

  return { data: data as Patient[], count };
}

export async function getPatientById(id: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('patients')
    .select('*, prescriptions:prescriptions_header(*, prescription_details(*, medicines(name, packing_spec)))')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching patient by id:', error);
    return null;
  }

  return data;
}

export async function addPatient(data: PatientFormData) {
  const supabase = await createClient();
  const nameNormalized = removeDiacritics(data.name);

  // Check existing patient (same normalized name and DOB)
  const { data: existing } = await supabase
    .from('patients')
    .select('id')
    .eq('name_normalized', nameNormalized)
    .eq('dob', data.dob || '')
    .maybeSingle();

  if (existing) {
    // Patient already exists, update info and return
    const updated = await updatePatient(existing.id, data);
    return { data: updated as Patient, isExisting: true };
  }

  // New patient - insert as normal
  const patientData = {
    ...data,
    name_normalized: nameNormalized,
  };

  const { data: insertedData, error } = await supabase
    .from('patients')
    .insert([patientData])
    .select()
    .single();

  if (error) {
    console.error('Error adding patient:', error);
    throw new Error('Failed to add patient');
  }

  revalidatePath('/patients');
  return { data: insertedData as Patient, isExisting: false };
}

export async function updatePatient(id: number, data: PatientFormData) {
  const supabase = await createClient();

  const patientData = {
    ...data,
    name_normalized: removeDiacritics(data.name),
  };

  const { data: updatedData, error } = await supabase
    .from('patients')
    .update(patientData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating patient:', error);
    throw new Error('Failed to update patient');
  }

  revalidatePath('/patients');
  revalidatePath(`/patients/${id}`);
  return updatedData;
}

export async function deletePatient(id: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting patient:', error);
    throw new Error('Failed to delete patient');
  }

  revalidatePath('/patients');
  return { success: true };
}

export async function getTotalPatientCount() {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error getting patient count:', error);
    throw new Error('Failed to get patient count');
  }

  return count || 0;
}

export async function getMedicineUsageByPatient(patientId: number) {
  const supabase = await createClient();

  // Lấy tất cả chi tiết đơn thuốc của bệnh nhân này
  const { data, error } = await supabase
    .from('prescription_details')
    .select(`
      medicine_id,
      medicines(name, packing_spec),
      prescriptions_header!inner(patient_id)
    `)
    .eq('prescriptions_header.patient_id', patientId);

  if (error) {
    console.error('Error fetching medicine usage:', error);
    return [];
  }

  // Nhóm theo medicine_id và đếm số lần kê
  const usageMap = new Map<number, { medicine_name: string; packing_spec: string; times_prescribed: number }>();
  
  for (const item of data || []) {
    const id = item.medicine_id;
    const medicine = item.medicines as unknown as { name: string; packing_spec: string } | null;
    
    const existing = usageMap.get(id);
    if (existing) {
      existing.times_prescribed += 1;
    } else {
      usageMap.set(id, {
        medicine_name: medicine?.name || 'Không rõ',
        packing_spec: medicine?.packing_spec || '',
        times_prescribed: 1,
      });
    }
  }

  // Chuyển Map thành Array và sắp xếp giảm dần
  return Array.from(usageMap.values())
    .sort((a, b) => b.times_prescribed - a.times_prescribed);
}
