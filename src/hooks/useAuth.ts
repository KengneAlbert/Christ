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
            initialized: true 
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
          try {
            supabase
              .from('admin_users')
              .upsert({
                id: session.user.id,
                email: session.user.email,
                last_login: new Date().toISOString(),
                is_active: true
              }, { onConflict: 'id' });
          } catch (error) {
            console.error('Error updating last_login:', error);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  type AuthAttempt = { email: string; timestamp: number; success: boolean };

  const signIn = async (email: string, password: string) => {
    try {
      if (typeof window !== 'undefined') {
        const attempts: AuthAttempt[] = JSON.parse(localStorage.getItem('auth_attempts') || '[]');
        const hourAgo = Date.now() - (60 * 60 * 1000);
        const recentFailures = attempts.filter((attempt: AuthAttempt) => 
          attempt.email === email && 
          !attempt.success && 
          attempt.timestamp > hourAgo
        );
        
        if (recentFailures.length >= 5) {
          throw new Error('Trop de tentatives de connexion. Veuillez patienter 1 heure.');
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        if (typeof window !== 'undefined') {
          const attempts: AuthAttempt[] = JSON.parse(localStorage.getItem('auth_attempts') || '[]');
          attempts.push({ email, timestamp: Date.now(), success: false });
          localStorage.setItem('auth_attempts', JSON.stringify(attempts));
        }
        
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou mot de passe incorrect');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Veuillez confirmer votre email avant de vous connecter');
        } else {
          throw new Error('Erreur de connexion. Vérifiez votre configuration Supabase');
        }
      }
      
      if (data?.user && typeof window !== 'undefined') {
        const attempts: AuthAttempt[] = JSON.parse(localStorage.getItem('auth_attempts') || '[]');
        attempts.push({ email, timestamp: Date.now(), success: true });
        localStorage.setItem('auth_attempts', JSON.stringify(attempts));
        
        try {
          await supabase
            .from('admin_users')
            .upsert({
              id: data.user.id,
              email: data.user.email,
              last_login: new Date().toISOString(),
              is_active: true
            }, { onConflict: 'id' });
        } catch (dbError) {
          console.warn('Erreur base de données admin:', dbError);
        }
      }
      
      return { data, error: null };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Erreur de connexion');
      return { data: null, error: err };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      if (password.length < 12 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
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
        try {
          await supabase
            .from('admin_users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              is_active: true
            });
        } catch (dbError) {
          console.warn('Erreur création admin_users:', dbError);
        }
      }
      
      return { data, error: null };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Erreur création compte');
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin`,
    });
    return { data, error };
  };

  return {
    user: authState.user,
    loading: authState.loading,
    initialized: authState.initialized,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
};
