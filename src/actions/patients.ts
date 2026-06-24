'use server';

import { getAuthUser } from '@/lib/supabase/auth';
import { removeDiacritics } from '@/lib/utils/normalize';
import { PatientFormData } from '@/types/forms';
import { Patient } from '@/types/database';
import { revalidatePath } from 'next/cache';
import { patientFormSchema } from '@/lib/validations/patient';
import { formatZodError } from '@/lib/validations/helpers';
import { cache } from 'react';
import { getGenericErrorMessage } from '@/lib/error-handler';

export async function getPatientsPaginated(page: number, pageSize: number) {
  const { supabase } = await getAuthUser();
  
  const offset = (page - 1) * pageSize;

  const { data, error } = await supabase.rpc('get_patients_with_last_visit', {
    p_search_term: null,
    p_search_normalized: null,
    p_limit: pageSize,
    p_offset: offset,
  });

  if (error) {
    throw new Error(getGenericErrorMessage(error));
  }

  const count = data && data.length > 0 ? Number(data[0].total_count) : 0;
  
  // Map RPC result to Patient type (loại bỏ total_count khỏi mỗi row)
  const patients: Patient[] = (data || []).map(({ total_count, ...patient }: any) => ({
    ...patient,
    last_visit_date: patient.last_visit_date || null,
  })) as Patient[];

  return { data: patients, count };
}

export async function searchPatients(term: string, page: number, pageSize: number) {
  const { supabase } = await getAuthUser();
  
  const offset = (page - 1) * pageSize;
  const normalizedTerm = removeDiacritics(term);

  const { data, error } = await supabase.rpc('get_patients_with_last_visit', {
    p_search_term: term || null,
    p_search_normalized: normalizedTerm || null,
    p_limit: pageSize,
    p_offset: offset,
  });

  if (error) {
    throw new Error(getGenericErrorMessage(error));
  }

  const count = data && data.length > 0 ? Number(data[0].total_count) : 0;
  
  const patients: Patient[] = (data || []).map(({ total_count, ...patient }: any) => ({
    ...patient,
    last_visit_date: patient.last_visit_date || null,
  })) as Patient[];

  return { data: patients, count };
}

export const getPatientBasicInfo = cache(async (id: number) => {
  const { supabase } = await getAuthUser();

  const { data: patient, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !patient) {
    if (error) console.error('Error fetching patient basic info:', error.message || error);
    return null;
  }

  return patient as Patient;
});

export const getPatientById = cache(async (id: number) => {
  const { supabase } = await getAuthUser();

  // Create promises for parallel execution
  const patientPromise = supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  const prescriptionsPromise = supabase
    .from('prescriptions_header')
    .select('*, prescription_details(*, medicines(name, packing_spec))', { count: 'exact' })
    .eq('patient_id', id)
    .order('prescription_date', { ascending: false })
    .limit(10);

  const historyLogsPromise = supabase
    .from('patient_history_logs')
    .select('*')
    .eq('patient_id', id)
    .order('created_at', { ascending: false });

  // Execute all queries in parallel
  const [patientRes, rxRes, historyRes] = await Promise.all([
    patientPromise,
    prescriptionsPromise,
    historyLogsPromise
  ]);

  const { data: patient, error: pErr } = patientRes;
  const { data: prescriptions, error: rxErr, count } = rxRes;
  const { data: historyLogs, error: hErr } = historyRes;

  if (pErr || !patient) {
    if (pErr) console.error('Error fetching patient by id:', pErr.message || pErr);
    return null;
  }

  if (rxErr) {
    console.error('Error fetching patient prescriptions:', rxErr.message || rxErr);
  }

  if (hErr) {
    console.error('Error fetching history logs:', hErr.message || hErr);
  }

  return { 
    ...patient, 
    prescriptions: prescriptions || [], 
    totalPrescriptions: count || 0,
    historyLogs: historyLogs || []
  };
});

export async function getPatientPrescriptionsPaginated(
  patientId: number, 
  page: number = 1, 
  pageSize: number = 10
) {
  const { supabase } = await getAuthUser();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('prescriptions_header')
    .select('*, prescription_details(*, medicines(name, packing_spec))', { count: 'exact' })
    .eq('patient_id', patientId)
    .order('prescription_date', { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(getGenericErrorMessage(error));
  }

  return { 
    data: data || [], 
    count, 
    hasMore: (count || 0) > to + 1 
  };
}

export async function addPatient(rawData: PatientFormData) {
  const { supabase } = await getAuthUser();

  // Validate and whitelist fields
  const validation = patientFormSchema.safeParse(rawData);
  if (!validation.success) {
    throw new Error(formatZodError(validation.error));
  }
  const data = validation.data;

  const nameNormalized = removeDiacritics(data.name);

  // Use upsert RPC - atomic, no race condition
  const { data: result, error } = await supabase.rpc('upsert_patient', {
    p_name: data.name,
    p_name_normalized: nameNormalized,
    p_dob: data.dob || '',
    p_gender: data.gender || '',
    p_phone: data.phone || '',
    p_address: data.address || '',
    p_diagnosis: data.diagnosis || '',
    p_weight: data.weight || '',
    p_medical_history: data.medical_history || '',
  });

  if (error) {
    throw new Error(getGenericErrorMessage(error));
  }

  // result is returned from RPC as { patient_data: jsonb, is_existing: boolean }
  const { patient_data, is_existing } = result[0];

  revalidatePath('/patients');
  return { data: patient_data as Patient, isExisting: is_existing };
}

export async function updatePatient(id: number, rawData: PatientFormData) {
  const { supabase } = await getAuthUser();

  // Validate and whitelist fields
  const validation = patientFormSchema.safeParse(rawData);
  if (!validation.success) {
    throw new Error(formatZodError(validation.error));
  }
  const data = validation.data;

  // Whitelist fields to avoid mass assignment
  const patientData = {
    name: data.name,
    name_normalized: removeDiacritics(data.name),
    dob: data.dob,
    gender: data.gender,
    phone: data.phone,
    address: data.address,
    diagnosis: data.diagnosis,
    weight: data.weight,
    medical_history: data.medical_history,
  };

  const { data: updatedData, error } = await supabase
    .from('patients')
    .update(patientData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(getGenericErrorMessage(error));
  }

  revalidatePath('/patients');
  revalidatePath(`/patients/${id}`);
  return updatedData;
}

export async function deletePatient(id: number) {
  const { supabase } = await getAuthUser();

  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(getGenericErrorMessage(error));
  }

  revalidatePath('/patients');
  return { success: true };
}

export async function getTotalPatientCount() {
  const { supabase } = await getAuthUser();

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
  const { supabase } = await getAuthUser();

  const { data, error } = await supabase.rpc('get_medicine_usage_by_patient', {
    p_patient_id: patientId
  });

  if (error) {
    console.error('Error fetching medicine usage RPC:', error);
    return [];
  }

  return data || [];
}

export async function getPotentialDuplicates() {
  const { supabase } = await getAuthUser();

  const { data, error } = await supabase.rpc('get_potential_duplicates');

  if (error) {
    console.error('Error fetching potential duplicates:', error);
    throw new Error('Failed to fetch potential duplicates');
  }

  return data as {
    name_normalized: string;
    dob: string;
    phone: string;
    patient_ids: number[];
    patient_names: string[];
    patient_addresses: string[];
  }[];
}

export async function mergePatients(masterId: number, duplicateIds: number[]) {
  const { supabase } = await getAuthUser();

  // duplicateIds should not include masterId
  const idsToDelete = duplicateIds.filter(id => id !== masterId);

  if (idsToDelete.length === 0) {
    return { success: true, message: 'No duplicates to merge' };
  }

  const { error } = await supabase.rpc('merge_patients', {
    master_id: masterId,
    duplicate_ids: idsToDelete
  });

  if (error) {
    console.error('Error merging patients:', error);
    throw new Error(`Failed to merge patients: ${error.message || JSON.stringify(error)}`);
  }

  revalidatePath('/patients');
  return { success: true };
}
