'use server';

import { createClient } from '@/lib/supabase/server';
import { CreatePrescriptionData, PrescriptionItem } from '@/types/forms';
import { revalidatePath } from 'next/cache';
import { createPrescriptionSchema } from '@/lib/validations/prescription';
import { formatZodError } from '@/lib/validations/helpers';

export async function createPrescription(rawData: CreatePrescriptionData) {
  const supabase = await createClient();

  // Validate and whitelist
  const validation = createPrescriptionSchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false, error: formatZodError(validation.error) };
  }
  const data = validation.data;

  // Use Math.round for monetary values to avoid floating point issues
  const sanitizedFee = Math.round(data.consultation_fee);
  const sanitizedItems = data.items.map(item => ({
    ...item,
    unit_price: Math.round(item.unit_price)
  }));

  const { data: headerId, error } = await supabase.rpc('create_prescription', {
    p_patient_id: data.patient_id,
    p_diagnosis: data.diagnosis,
    p_items: sanitizedItems,
    p_notes: data.notes || '',
    p_consultation_fee: sanitizedFee
  });

  if (error) {
    console.error('Error creating prescription:', error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/patients/${data.patient_id}`);
  return { success: true, id: headerId };
}

export async function appendToPrescription(prescriptionId: number, items: PrescriptionItem[], patientId: number) {
  const supabase = await createClient();

  const { error } = await supabase.rpc('append_to_prescription', {
    p_header_id: prescriptionId,
    p_items: items
  });

  if (error) {
    console.error('Error appending to prescription:', error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/patients/${patientId}`);
  return { success: true };
}

export async function getPrescriptionsByPatient(patientId: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('prescriptions_header')
    .select(`
      *,
      prescription_details (
        *,
        medicines (
          name,
          packing_spec
        )
      )
    `)
    .eq('patient_id', patientId)
    .order('prescription_date', { ascending: false });

  if (error) {
    console.error('Error fetching prescriptions:', error);
    return [];
  }

  return data;
}

export async function getLatestPrescriptionId(patientId: number) {
  const supabase = await createClient();

  // Get prescriptions created today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('prescriptions_header')
    .select('id')
    .eq('patient_id', patientId)
    .gte('prescription_date', today.toISOString())
    .order('prescription_date', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return null;
  }

  return data[0].id;
}

export async function getConsultationFee() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'consultation_fee')
    .single();

  if (error) {
    // Default fee if not found
    return 30000;
  }

  return parseFloat(data.value);
}
