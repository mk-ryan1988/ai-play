import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

export function createClient() {
  return createRouteHandlerClient<Database>({ cookies });
}

export async function getAuthUser() {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) throw error;
  if (!session) return null;

  return session.user;
}
