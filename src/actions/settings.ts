'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getGenericErrorMessage } from '@/lib/error-handler';
 
const ALLOWED_SETTING_KEYS = [
  'consultation_fee',
  'drug_presets',
  'clinic_name',
  'clinic_address',
  'clinic_phone'
];

export async function getAllSettings(): Promise<Record<string, string>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const { data, error } = await supabase
    .from('settings')
    .select('key, value');

  if (error) {
    console.error('Error fetching settings:', error);
    return {};
  }

  return data.reduce((acc, { key, value }) => {
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
}

export async function updateSetting(key: string, value: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  if (!ALLOWED_SETTING_KEYS.includes(key)) {
    throw new Error(`Setting key "${key}" is not allowed`);
  }

  const { error } = await supabase
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key' });

  if (error) {
    throw new Error(getGenericErrorMessage(error));
  }

  revalidatePath('/settings');
}

export async function updateMultipleSettings(settings: Record<string, string>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const upsertData = Object.entries(settings)
    .filter(([key]) => ALLOWED_SETTING_KEYS.includes(key))
    .map(([key, value]) => ({
      key,
      value,
    }));

  if (upsertData.length === 0) return;

  const { error } = await supabase
    .from('settings')
    .upsert(upsertData, { onConflict: 'key' });

  if (error) {
    throw new Error(getGenericErrorMessage(error));
  }

  revalidatePath('/settings');
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Verify old password by re-signing in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) {
    throw new Error('Mật khẩu hiện tại không chính xác');
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) {
    throw new Error(getGenericErrorMessage(error));
  }
}

export async function getDrugPresets() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'drug_presets')
    .single();

  if (error || !data) {
    return [];
  }

  try {
    return JSON.parse(data.value);
  } catch {
    return [];
  }
}

export async function saveDrugPresets(presets: unknown[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const { error } = await supabase
    .from('settings')
    .upsert({ key: 'drug_presets', value: JSON.stringify(presets) }, { onConflict: 'key' });

  if (error) {
    throw new Error(getGenericErrorMessage(error));
  }

  revalidatePath('/dose-calculator');
}
