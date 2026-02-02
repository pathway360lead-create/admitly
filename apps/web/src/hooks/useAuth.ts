import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@admitly/types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export function useAuth() {
  const navigate = useNavigate();
  const { user, profile, isLoading, isAuthenticated, setUser, setProfile, setLoading, logout } = useAuthStore();

  useEffect(() => {
    // Listen for auth state changes - Supabase's recommended pattern
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[useAuth] Auth event:', event);

      if (event === 'SIGNED_IN' && session) {
        setUser(session.user);

        // Fetch user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setProfile(profile);
        }
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setLoading(false);
      } else if (event === 'INITIAL_SESSION') {
        // This fires when auth initializes
        if (session?.user) {
          setUser(session.user);

          // Fetch user profile
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setProfile(profile);
          }
        }
        // ALWAYS set loading false after INITIAL_SESSION
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount

  const login = async ({ email, password }: LoginCredentials) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setUser(data.user);

        // Fetch user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          setProfile(profile);
        }

        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ email, password, fullName, role }: RegisterData) => {
    try {
      setLoading(true);

      // Create auth user with metadata for the trigger
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (authError) throw authError;

      // Check if email confirmation is required
      if (authData.user && !authData.session) {
        // Email confirmation required
        return {
          success: true,
          requiresEmailConfirmation: true,
          message: 'Please check your email to confirm your account.'
        };
      }

      if (authData.user && authData.session) {
        // User is immediately authenticated (email confirmation disabled)
        setUser(authData.user);

        // Fetch the auto-created profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profile) {
          setProfile(profile);
        }

        return { success: true, requiresEmailConfirmation: false };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const loginWithOAuth = async (provider: 'google' | 'facebook') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('OAuth login error:', error);
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    user,
    profile,
    isLoading,
    isAuthenticated,
    login,
    register,
    loginWithOAuth,
    resetPassword,
    logout: handleLogout,
  };
}
