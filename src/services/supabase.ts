import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Checks whether valid Supabase configuration is present.
 */
export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('your-project-id') &&
    supabaseUrl.startsWith('https://')
  );
};

// Fallback dummy URL and Key to prevent initialization crash if unconfigured
const effectiveUrl = isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co';
const effectiveAnonKey = isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-anon-key';

/**
 * Universal Supabase client for TransitHub.
 * Configured with React Native AsyncStorage for persistent auth sessions.
 */
export const supabase: SupabaseClient = createClient(effectiveUrl, effectiveAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
