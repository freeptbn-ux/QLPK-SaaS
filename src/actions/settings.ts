'use server';

import { getAuthUser } from '@/lib/supabase/auth';
import { revalidatePath, updateTag, unstable_cache } from 'next/cache';
import { getGenericErrorMessage } from '@/lib/error-handler';
 
const ALLOWED_SETTING_KEYS = [
  'consultation_fee',
  'drug_presets',
  'clinic_name',
  'clinic_address',
  'clinic_phone',
  'doctor_name'
];

export async function getAllSettings(): Promise<Record<string, string>> {
  const { supabase } = await getAuthUser();
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

/**
 * Cached version of getAllSettings for use in layouts.
 * Revalidates every 5 minutes or when the 'settings' tag is invalidated.
 */
export const getCachedSettings = unstable_cache(
  async () => {
    return getAllSettings();
  },
  ['dashboard-settings'],
  {
    revalidate: 300,
    tags: ['settings'],
  }
);

export async function updateSetting(key: string, value: string) {
  const { supabase } = await getAuthUser();

  if (!ALLOWED_SETTING_KEYS.includes(key)) {
    throw new Error(`Setting key "${key}" is not allowed`);
  }

  const { error } = await supabase
    .from('settings')
    .upsert({ key, value }, { onConflict: 'clinic_id, key' });

  if (error) {
    throw new Error(getGenericErrorMessage(error));
  }

  revalidatePath('/', 'layout');
  updateTag('settings');
}

export async function updateMultipleSettings(settings: Record<string, string>) {
  const { supabase } = await getAuthUser();

  const upsertData = Object.entries(settings)
    .filter(([key]) => ALLOWED_SETTING_KEYS.includes(key))
    .map(([key, value]) => ({
      key,
      value,
    }));

  if (upsertData.length === 0) return;

  const { error } = await supabase
    .from('settings')
    .upsert(upsertData, { onConflict: 'clinic_id, key' });

  if (error) {
    throw new Error(getGenericErrorMessage(error));
  }

  revalidatePath('/', 'layout');
  updateTag('settings');
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const { user, supabase } = await getAuthUser();

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
  const { supabase } = await getAuthUser();
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
  const { supabase } = await getAuthUser();
  const { error } = await supabase
    .from('settings')
    .upsert({ key: 'drug_presets', value: JSON.stringify(presets) }, { onConflict: 'clinic_id, key' });

  if (error) {
    throw new Error(getGenericErrorMessage(error));
  }

  revalidatePath('/dose-calculator');
  updateTag('settings');
}
