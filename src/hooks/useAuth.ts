import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    initialized: false,
  });

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          setAuthState({
            user: data?.session?.user ?? null,
            loading: false,
            initialized: true,
          });
        }
      } catch (error) {
        console.error('Erreur initialisation auth:', error);
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            loading: false,
            initialized: true,
          }));
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (mounted) {
          setAuthState({
            user: session?.user ?? null,
            loading: false,
            initialized: true,
          });
        }

        if (event === 'SIGNED_IN' && session?.user) {
          supabase
            .from('admin_users')
            .upsert({
              id: session.user.id,
              email: session.user.email,
              last_login: new Date().toISOString(),
              is_active: true,
            }, { onConflict: 'id' })
            .then(({ error }) => {
              if (error) console.warn('Erreur mise à jour last_login:', error);
            });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Rate limiting côté serveur (remplace localStorage)
      const { data: isBlocked, error: rlError } = await supabase
        .rpc('check_login_rate_limit', { p_email: email });

      if (!rlError && isBlocked) {
        throw new Error('Trop de tentatives de connexion. Veuillez patienter 1 heure.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        await supabase.rpc('record_login_attempt', { p_email: email, p_success: false });

        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou mot de passe incorrect');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Veuillez confirmer votre email avant de vous connecter');
        } else {
          throw new Error('Erreur de connexion. Vérifiez votre configuration Supabase');
        }
      }

      if (data?.user) {
        await supabase.rpc('record_login_attempt', { p_email: email, p_success: true });

        await supabase
          .from('admin_users')
          .upsert({
            id: data.user.id,
            email: data.user.email,
            last_login: new Date().toISOString(),
            is_active: true,
          }, { onConflict: 'id' })
          .then(({ error: dbErr }) => {
            if (dbErr) console.warn('Erreur base de données admin:', dbErr);
          });
      }

      return { data, error: null };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Erreur de connexion');
      return { data: null, error: err };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      if (
        password.length < 12 ||
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) ||
        !/\d/.test(password) ||
        !/[!@#$%^&*(),.?":{}|<>]/.test(password)
      ) {
        throw new Error('Le mot de passe ne respecte pas les critères de sécurité.');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error('Un compte existe déjà avec cette adresse email');
        } else {
          throw new Error('Erreur lors de la création du compte.');
        }
      }

      if (data?.user) {
        await supabase
          .from('admin_users')
          .insert({ id: data.user.id, email: data.user.email, is_active: true })
          .then(({ error: dbErr }) => {
            if (dbErr) console.warn('Erreur création admin_users:', dbErr);
          });
      }

      return { data, error: null };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Erreur création compte');
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Erreur déconnexion:', error);
    return { error };
  };

  const resetPassword = async (email: string) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin`,
    });
  };

  // ── MFA ────────────────────────────────────────────────────
  const listMFAFactors = async () => {
    return supabase.auth.mfa.listFactors();
  };

  const enrollMFA = async () => {
    return supabase.auth.mfa.enroll({ factorType: 'totp' });
  };

  const verifyMFA = async (factorId: string, code: string) => {
    return supabase.auth.mfa.challengeAndVerify({ factorId, code });
  };

  const unenrollMFA = async (factorId: string) => {
    return supabase.auth.mfa.unenroll({ factorId });
  };
  // ───────────────────────────────────────────────────────────

  return {
    user: authState.user,
    loading: authState.loading,
    initialized: authState.initialized,
    signIn,
    signUp,
    signOut,
    resetPassword,
    listMFAFactors,
    enrollMFA,
    verifyMFA,
    unenrollMFA,
  };
};
