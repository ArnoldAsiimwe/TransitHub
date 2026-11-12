import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase, isSupabaseConfigured } from './supabase';
import { UserProfile, UserRole } from '../types';

WebBrowser.maybeCompleteAuthSession();

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
          name: 'Transit Commuter',
          phone,
          email: `${phone.replace(/[^0-9]/g, '')}@transithub.mbarara.ug`,
          role: 'passenger',
          joinedDate: 'Active Member',
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
        // Fetch or create public profile
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const profileName = profileRow?.full_name || data.user.user_metadata?.full_name || 'Transit Commuter';
        const profileRole = (profileRow?.role as UserRole) || (data.user.user_metadata?.role as UserRole) || 'passenger';

        const profile: UserProfile = {
          id: data.user.id,
          name: profileName,
          phone: profileRow?.phone || phone,
          email: profileRow?.email || data.user.email,
          role: profileRole,
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
   * Sign in with Google via Supabase OAuth
   */
  async signInWithGoogle(): Promise<{ profile: UserProfile | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { profile: null, error: 'Database is not configured for Google Sign In.' };
    }

    try {
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: 'transithub',
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        return { profile: null, error: error.message };
      }

      if (!data?.url) {
        return { profile: null, error: 'Unable to initialize Google Sign In URL.' };
      }

      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (res.type === 'success' && res.url) {
        // Extract access_token & refresh_token from url fragment or query
        const urlObj = new URL(res.url);
        const params = new URLSearchParams(urlObj.hash.substring(1) || urlObj.search);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          const { data: sessionData, error: sessionErr } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionErr) {
            return { profile: null, error: sessionErr.message };
          }

          if (sessionData.user) {
            const user = sessionData.user;
            const fullName = user.user_metadata?.full_name || user.user_metadata?.name || 'Google Commuter';
            const phone = user.user_metadata?.phone || '+256 700 000 000';
            const email = user.email || '';

            // Ensure profile exists in profiles table
            await supabase.from('profiles').upsert({
              id: user.id,
              full_name: fullName,
              phone: phone,
              email: email,
              role: 'passenger',
            });

            const profile: UserProfile = {
              id: user.id,
              name: fullName,
              phone: phone,
              email: email,
              role: 'passenger',
              joinedDate: 'Active Member',
            };

            return { profile, error: null };
          }
        }
      }

      if (res.type === 'cancel') {
        return { profile: null, error: 'Google sign in was cancelled.' };
      }

      return { profile: null, error: 'Failed to complete Google authentication.' };
    } catch (err: any) {
      return { profile: null, error: err.message || 'Error signing in with Google.' };
    }
  },
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
