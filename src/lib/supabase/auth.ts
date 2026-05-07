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
  
  return { user, supabase };
});
