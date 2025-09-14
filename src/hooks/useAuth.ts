import { useState, useEffect } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthSecurityService } from '../services/authSecurityService';

interface AuthState {
  user: User | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        setAuthState({
          user: session?.user ?? null,
          loading: false,
        });
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setAuthState({
          user: null,
          loading: false,
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState({
          user: session?.user ?? null,
          loading: false,
        });

        // Update last_login for admin users
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            await supabase
              .from('admin_users')
              .update({ last_login: new Date().toISOString() })
              .eq('id', session.user.id);
          } catch (error) {
            console.error('Error updating last_login:', error);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Gérer les erreurs spécifiques de Supabase
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou mot de passe incorrect');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Veuillez confirmer votre email avant de vous connecter');
        } else if (error.message.includes('Too many requests')) {
          throw new Error('Trop de tentatives. Veuillez patienter avant de réessayer');
        } else {
          throw new Error('Erreur de connexion. Vérifiez votre configuration Supabase');
        }
      }
      
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Vérifier d'abord si l'email est autorisé
      if (!AuthSecurityService.isEmailAuthorizedForAdmin(email)) {
        throw new Error('Cette adresse email n\'est pas autorisée pour l\'inscription admin');
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
        } else if (error.message.includes('Password should be at least')) {
          throw new Error('Le mot de passe ne respecte pas les critères de sécurité');
        } else {
          throw new Error('Erreur lors de la création du compte. Vérifiez votre configuration Supabase');
        }
      }
      
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    // Nettoyer la session sécurisée
    AuthSecurityService.clearSession();
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin`,
      });
      
      if (error) {
        throw new Error('Erreur lors de l\'envoi de l\'email de réinitialisation');
      }
      
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  return {
    user: authState.user,
    loading: authState.loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
};