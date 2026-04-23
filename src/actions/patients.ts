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
    .select('*, prescriptions:prescriptions_header(*, prescription_details(*, medicines(name, unit)))')
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

  const patientData = {
    ...data,
    name_normalized: removeDiacritics(data.name),
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
  return insertedData;
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
