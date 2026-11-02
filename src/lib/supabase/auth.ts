import { cache } from 'react';
import { createClient } from './server';

/**
 * Shared cached auth helper to prevent multiple getUser() calls in the same request.
 * React cache() ensures this only runs once per server request.
 */
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('Unauthorized');
  }

  // Check app_metadata first (populated securely by server / DB trigger)
  let clinicId = user.app_metadata?.clinic_id;
  let role = user.app_metadata?.role;
  let profile = null;

  // Fallback to querying profiles table if claims are missing from app_metadata
  if (!clinicId || !role) {
    const { data: dbProfile } = await supabase
      .from('profiles')
      .select('clinic_id, role')
      .eq('id', user.id)
      .single();

    profile = dbProfile;
    clinicId = clinicId ?? dbProfile?.clinic_id ?? user.user_metadata?.clinic_id;
    role = role ?? dbProfile?.role ?? user.user_metadata?.role;
  } else {
    profile = {
      clinic_id: clinicId,
      role,
      ...(user.user_metadata?.full_name ? { full_name: user.user_metadata.full_name } : {}),
    };
  }

  return {
    user,
    supabase,
    clinicId,
    clinic_id: clinicId,
    role,
    profile,
  };
});
