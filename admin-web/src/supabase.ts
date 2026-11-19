import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://lhevzrmskzvablxbrxus.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_SW_x2YQmy4qV0LkQ83SJiw_BYx88wWq';

// Custom service role key support for unrestricted administrative authority
export const getAdminKey = (): string => {
  return localStorage.getItem('transit_admin_key') || SUPABASE_ANON_KEY;
};

export const setAdminKey = (key: string) => {
  localStorage.setItem('transit_admin_key', key);
};

export const clearAdminKey = () => {
  localStorage.removeItem('transit_admin_key');
};

export const getSupabaseClient = () => {
  return createClient(SUPABASE_URL, getAdminKey());
};

export const supabase = createClient(SUPABASE_URL, getAdminKey());
