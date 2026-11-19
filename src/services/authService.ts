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
    usernameOrName: string,
    phone: string,
    email?: string,
    password?: string
  ): Promise<{ profile: UserProfile | null; error: string | null }> {
    const cleanUsername = usernameOrName.trim();
    const cleanPhone = phone ? phone.trim().replace(/\s+/g, '') : '';
    const securePassword = password || 'TransitMbarara2026!';

    if (!isSupabaseConfigured()) {
      // Local fallback mode
      const mockProfile: UserProfile = {
        id: `usr_${Date.now().toString().slice(-6)}`,
        name: cleanUsername,
        phone: cleanPhone,
        email: email || '',
        role: 'passenger',
        joinedDate: 'Today',
      };
      return { profile: mockProfile, error: null };
    }

    try {
      // Map username to a safe internal authentication email
      const normalizedUsername = cleanUsername.toLowerCase().replace(/[^a-z0-9_]/g, '');
      const authEmail = email && email.includes('@')
        ? email.trim().toLowerCase()
        : `${normalizedUsername || Date.now()}@transithub.mbarara.ug`;

      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: securePassword,
        options: {
          data: {
            username: cleanUsername,
            full_name: cleanUsername,
            phone: cleanPhone,
            role: 'passenger',
          },
        },
      });

      if (error) {
        return { profile: null, error: error.message };
      }

      if (data.user) {
        // Upsert public profile record in supabase
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          phone: cleanPhone || `usr_${data.user.id.slice(0, 8)}`,
          full_name: cleanUsername,
          role: 'passenger',
          email: email || authEmail,
        });

        if (profileError) {
          console.warn('[Supabase Profile Upsert Notice]', profileError.message);
        }

        const profile: UserProfile = {
          id: data.user.id,
          name: cleanUsername,
          phone: cleanPhone,
          email: email || authEmail,
          role: 'passenger',
          joinedDate: 'Today',
        };

        return { profile, error: null };
      }

      return { profile: null, error: 'Registration completed. Please sign in.' };
    } catch (err: any) {
      return { profile: null, error: err.message || 'An unexpected error occurred during sign up.' };
    }
  },

  /**
   * Sign in with username (or email/phone) and password
   */
  async login(
    identifier: string,
    password?: string
  ): Promise<{ profile: UserProfile | null; error: string | null }> {
    const cleanId = identifier.trim();
    const loginPass = password || 'TransitMbarara2026!';

    if (!isSupabaseConfigured()) {
      // Offline fallback
      return {
        profile: {
          id: 'usr_local_001',
          name: cleanId,
          phone: '',
          email: `${cleanId}@transithub.mbarara.ug`,
          role: 'passenger',
          joinedDate: 'Active Member',
        },
        error: null,
      };
    }

    try {
      // 1. First, check if identifier is an existing email
      let emailToAuth = cleanId;

      if (!cleanId.includes('@')) {
        // Look up profile by full_name/username in profiles table
        const { data: matchedProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone, role')
          .ilike('full_name', cleanId)
          .limit(1);

        if (matchedProfiles && matchedProfiles.length > 0 && matchedProfiles[0].email) {
          emailToAuth = matchedProfiles[0].email;
        } else {
          // Check if cleanId matches phone
          const { data: phoneProfiles } = await supabase
            .from('profiles')
            .select('id, full_name, email, phone, role')
            .eq('phone', cleanId)
            .limit(1);

          if (phoneProfiles && phoneProfiles.length > 0 && phoneProfiles[0].email) {
            emailToAuth = phoneProfiles[0].email;
          } else {
            // Fallback to internal constructed email format
            const normalizedUsername = cleanId.toLowerCase().replace(/[^a-z0-9_]/g, '');
            emailToAuth = `${normalizedUsername}@transithub.mbarara.ug`;
          }
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToAuth,
        password: loginPass,
      });

      if (error) {
        return { profile: null, error: error.message };
      }

      if (data.user) {
        // Fetch public profile
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const profileName = profileRow?.full_name || data.user.user_metadata?.full_name || data.user.user_metadata?.username || cleanId;
        const profileRole = (profileRow?.role as UserRole) || (data.user.user_metadata?.role as UserRole) || 'passenger';

        const profile: UserProfile = {
          id: data.user.id,
          name: profileName,
          phone: profileRow?.phone || '',
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
   * Sign in with Google via Supabase OAuth (supports PKCE code exchange & implicit token flows)
   */
  async signInWithGoogle(): Promise<{ profile: UserProfile | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { profile: null, error: 'Database is not configured for Google Sign In.' };
    }

    try {
      // 1. Generate the redirect URI pointing back to TransitHub
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: 'transithub',
        path: 'auth/callback',
      });

      // 2. Request OAuth authorization URL from Supabase
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

      // 3. Open the authentication browser session
      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (res.type === 'success' && res.url) {
        // Extract parameters from both hash (#) and search query (?)
        const rawUrl = res.url;
        let accessToken: string | null = null;
        let refreshToken: string | null = null;
        let authCode: string | null = null;

        // Try extracting code
        const codeMatch = rawUrl.match(/[?&]code=([^&#]+)/);
        if (codeMatch) {
          authCode = decodeURIComponent(codeMatch[1]);
        }

        // Try extracting tokens
        const accessMatch = rawUrl.match(/[#?&]access_token=([^&#]+)/);
        const refreshMatch = rawUrl.match(/[#?&]refresh_token=([^&#]+)/);
        if (accessMatch && refreshMatch) {
          accessToken = decodeURIComponent(accessMatch[1]);
          refreshToken = decodeURIComponent(refreshMatch[1]);
        }

        let authenticatedUser: any = null;

        // Flow A: PKCE exchange with auth code
        if (authCode) {
          const { data: exchangeData, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(authCode);
          if (exchangeErr) {
            console.warn('[Google Auth Code Exchange Error]', exchangeErr.message);
          } else if (exchangeData?.user) {
            authenticatedUser = exchangeData.user;
          }
        }

        // Flow B: Direct token setSession if code wasn't provided or needed
        if (!authenticatedUser && accessToken && refreshToken) {
          const { data: sessionData, error: sessionErr } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionErr) {
            console.warn('[Google Token Session Error]', sessionErr.message);
          } else if (sessionData?.user) {
            authenticatedUser = sessionData.user;
          }
        }

        // Flow C: Check active Supabase session if browser closed back
        if (!authenticatedUser) {
          const { data: currentSession } = await supabase.auth.getSession();
          if (currentSession?.session?.user) {
            authenticatedUser = currentSession.session.user;
          }
        }

        if (authenticatedUser) {
          const user = authenticatedUser;
          const fullName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            'Google Commuter';
          const phone = user.user_metadata?.phone || '';
          const email = user.email || '';

          // 4. Ensure profile exists in profiles table
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          let userRole: UserRole = 'passenger';
          if (existingProfile) {
            userRole = (existingProfile.role as UserRole) || 'passenger';
          } else {
            // Upsert new profile record for the Google user
            await supabase.from('profiles').upsert({
              id: user.id,
              full_name: fullName,
              phone: phone || `usr_${user.id.slice(0, 8)}`,
              email: email,
              role: 'passenger',
            });
          }

          const profile: UserProfile = {
            id: user.id,
            name: existingProfile?.full_name || fullName,
            phone: existingProfile?.phone || phone,
            email: email,
            role: userRole,
            joinedDate: existingProfile?.created_at
              ? new Date(existingProfile.created_at).toLocaleDateString()
              : 'Today',
          };

          return { profile, error: null };
        }

        return { profile: null, error: 'Authentication could not establish a user session.' };
      }

      if (res.type === 'cancel' || res.type === 'dismiss') {
        return { profile: null, error: 'Google sign in was cancelled.' };
      }

      return { profile: null, error: 'Failed to complete Google authentication.' };
    } catch (err: any) {
      return { profile: null, error: err.message || 'Error signing in with Google.' };
    }
  },
  /**
   * Reset / Recover Password for Mbarara transit users
   */
  async resetPassword(identifierOrEmail: string, newPassword?: string): Promise<{ success: boolean; message: string; error: string | null }> {
    const cleanId = identifierOrEmail.trim();
    if (!cleanId) {
      return { success: false, message: '', error: 'Please enter your username, email, or phone number.' };
    }

    if (!isSupabaseConfigured()) {
      return { success: true, message: 'Password reset link sent (Offline demo mode).', error: null };
    }

    try {
      // 1. If an email was directly provided
      if (cleanId.includes('@')) {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanId.toLowerCase(), {
          redirectTo: AuthSession.makeRedirectUri({ scheme: 'transithub', path: 'auth/reset-password' }),
        });
        if (error) {
          return { success: false, message: '', error: error.message };
        }
        return {
          success: true,
          message: `Password reset instructions have been dispatched to ${cleanId}. Check your inbox.`,
          error: null,
        };
      }

      // 2. If username or phone was provided, look up the profile email in profiles table
      const cleanPhone = cleanId.replace(/\s+/g, '');
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('email, phone, full_name')
        .or(`full_name.eq.${cleanId},phone.eq.${cleanPhone},phone.eq.${cleanId}`)
        .maybeSingle();

      const targetEmail = profileRow?.email;

      if (targetEmail && targetEmail.includes('@') && !targetEmail.endsWith('@transithub.mbarara.ug')) {
        const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
          redirectTo: AuthSession.makeRedirectUri({ scheme: 'transithub', path: 'auth/reset-password' }),
        });
        if (error) {
          return { success: false, message: '', error: error.message };
        }
        return {
          success: true,
          message: `Password recovery instructions have been sent to your registered email (${targetEmail}).`,
          error: null,
        };
      }

      // If user registered with username without an external email, let them know or assist with municipal support
      return {
        success: true,
        message: `Account located for "${profileRow?.full_name || cleanId}". Contact Mbarara Municipality Transit support (+256 700 000 000) or check with the administrator to reset credentials.`,
        error: null,
      };
    } catch (err: any) {
      return { success: false, message: '', error: err.message || 'Error processing password reset.' };
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
