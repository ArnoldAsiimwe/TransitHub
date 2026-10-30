import { supabase, isSupabaseConfigured } from './supabase';
import { UserProfile, UserRole } from '../types';

export const authService = {
  /**
   * Universal sign-up for all Mbarara transit users
   */
  async signUp(
    fullName: string,
    phone: string,
    email?: string,
    password?: string
  ): Promise<{ profile: UserProfile | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      // Local fallback mode
      const mockProfile: UserProfile = {
        id: `usr_${Date.now().toString().slice(-6)}`,
        name: fullName,
        phone,
        email: email || '',
        role: 'passenger',
        joinedDate: 'Today',
      };
      return { profile: mockProfile, error: null };
    }

    try {
      const generatedEmail = email || `${phone.replace(/[^0-9]/g, '')}@transithub.mbarara.ug`;
      const securePassword = password || 'TransitMbarara2026!';

      const { data, error } = await supabase.auth.signUp({
        email: generatedEmail,
        password: securePassword,
        options: {
          data: {
            full_name: fullName,
            phone,
            role: 'passenger',
          },
        },
      });

      if (error) {
        return { profile: null, error: error.message };
      }

      if (data.user) {
        // Insert public profile
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          phone,
          full_name: fullName,
          role: 'passenger',
          email: generatedEmail,
        });

        if (profileError) {
          console.warn('[Supabase Profile Upsert Error]', profileError.message);
        }

        const profile: UserProfile = {
          id: data.user.id,
          name: fullName,
          phone,
          email: generatedEmail,
          role: 'passenger',
          joinedDate: 'Today',
        };

        return { profile, error: null };
      }

      return { profile: null, error: 'Registration succeeded without session.' };
    } catch (err: any) {
      return { profile: null, error: err.message || 'An unexpected error occurred during sign up.' };
    }
  },

  /**
   * Sign in with phone/email and password
   */
  async login(
    phone: string,
    password?: string
  ): Promise<{ profile: UserProfile | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      // Offline fallback
      return {
        profile: {
          id: 'usr_local_001',
          name: 'Kiconco Brenda',
          phone,
          email: 'brenda.kiconco@must.ac.ug',
          role: 'passenger',
          joinedDate: 'Jan 2026',
        },
        error: null,
      };
    }

    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const loginEmail = `${cleanPhone}@transithub.mbarara.ug`;
      const loginPass = password || 'TransitMbarara2026!';

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPass,
      });

      if (error) {
        return { profile: null, error: error.message };
      }

      if (data.user) {
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const profile: UserProfile = {
          id: data.user.id,
          name: profileRow?.full_name || 'Transit Commuter',
          phone: profileRow?.phone || phone,
          email: profileRow?.email || data.user.email,
          role: (profileRow?.role as UserRole) || 'passenger',
          joinedDate: 'Active Member',
        };

        return { profile, error: null };
      }

      return { profile: null, error: 'User session not found.' };
    } catch (err: any) {
      return { profile: null, error: err.message || 'Error signing in.' };
    }
  },

  /**
   * Log out of current session
   */
  async logout(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[Supabase SignOut Error]', err);
      }
    }
  },

  /**
   * Fetch user profile from Supabase
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (!data) return null;

      return {
        id: data.id,
        name: data.full_name,
        phone: data.phone,
        email: data.email,
        role: data.role as UserRole,
        joinedDate: new Date(data.created_at).toLocaleDateString(),
      };
    } catch {
      return null;
    }
  },
};
