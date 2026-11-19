import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://lhevzrmskzvablxbrxus.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_SW_x2YQmy4qV0LkQ83SJiw_BYx88wWq';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
