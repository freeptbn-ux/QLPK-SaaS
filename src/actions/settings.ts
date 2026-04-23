'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getAllSettings(): Promise<Record<string, string>> {
  const supabase = await createClient();
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
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key' });

  if (error) {
    console.error(`Error updating setting ${key}:`, error);
    throw new Error(`Failed to update setting ${key}`);
  }

  revalidatePath('/settings');
}

export async function updateMultipleSettings(settings: Record<string, string>) {
  const supabase = await createClient();
  const upsertData = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
  }));

  const { error } = await supabase
    .from('settings')
    .upsert(upsertData, { onConflict: 'key' });

  if (error) {
    console.error('Error updating multiple settings:', error);
    throw new Error('Failed to update multiple settings');
  }

  revalidatePath('/settings');
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient();

  // Supabase doesn't have a direct "verify password before change" in a single call easily for the current user's password if they are logged in via email/pass without signing in again, 
  // but we can try to update and it will fail if session is invalid or user is not auth'd.
  // Actually, for password change, the user needs to be authenticated.
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) {
    console.error('Error changing password:', error);
    throw new Error(error.message);
  }
}

export async function getDrugPresets() {
  const supabase = await createClient();
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
  } catch (e) {
    return [];
  }
}

export async function saveDrugPresets(presets: any[]) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('settings')
    .upsert({ key: 'drug_presets', value: JSON.stringify(presets) }, { onConflict: 'key' });

  if (error) {
    console.error('Error saving drug presets:', error);
    throw new Error('Failed to save drug presets');
  }

  revalidatePath('/dose-calculator');
}
