import { useState, useEffect } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
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

    // Récupérer la session initiale avec retry
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
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
      async (event, session) => {
        if (mounted) {
          setAuthState({
            user: session?.user ?? null,
            loading: false,
            initialized: true,
          });
        }

        // Update last_login for admin users
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            await supabase
              .from('admin_users')
              .upsert({
                id: session.user.id,
                email: session.user.email,
                last_login: new Date().toISOString(),
                is_active: true
              }, {
                onConflict: 'id'
              });
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

  const signIn = async (email: string, password: string) => {
    try {
      // Vérifier si l'email est verrouillé
      if (typeof window !== 'undefined') {
        const attempts = JSON.parse(localStorage.getItem('auth_attempts') || '[]');
        const hourAgo = Date.now() - (60 * 60 * 1000);
        const recentFailures = attempts.filter((attempt: any) => 
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
        // Enregistrer l'échec
        if (typeof window !== 'undefined') {
          const attempts = JSON.parse(localStorage.getItem('auth_attempts') || '[]');
          attempts.push({
            email,
            timestamp: Date.now(),
            success: false
          });
          localStorage.setItem('auth_attempts', JSON.stringify(attempts));
        }
        
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
      
      // Enregistrer le succès
      if (data?.user && typeof window !== 'undefined') {
        const attempts = JSON.parse(localStorage.getItem('auth_attempts') || '[]');
        attempts.push({
          email,
          timestamp: Date.now(),
          success: true
        });
        localStorage.setItem('auth_attempts', JSON.stringify(attempts));
        
        // Sauvegarder la session pour la persistance
        sessionStorage.setItem('admin_session', JSON.stringify({
          user: data.user,
          timestamp: Date.now()
        }));
        
        // Créer ou mettre à jour l'utilisateur admin dans la base
        try {
          const { error: upsertError } = await supabase
            .from('admin_users')
            .upsert({
              id: data.user.id,
              email: data.user.email,
              last_login: new Date().toISOString(),
              is_active: true
            }, {
              onConflict: 'id'
            });
          
          if (upsertError) {
            console.warn('Erreur mise à jour admin_users:', upsertError);
          }
        } catch (dbError) {
          console.warn('Erreur base de données admin:', dbError);
        }
      }
      
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // La vérification de l'autorisation de l'email est désormais gérée par la fonction Supabase `auth-register`.
      // Cette fonction est appelée depuis AdminAuth.tsx.
      
      // Validation du mot de passe (peut rester côté client pour une meilleure UX)
      if (password.length < 12) {
        throw new Error('Le mot de passe doit contenir au moins 12 caractères');
      }
      if (!/[A-Z]/.test(password)) {
        throw new Error('Le mot de passe doit contenir au moins une majuscule');
      }
      if (!/[a-z]/.test(password)) {
        throw new Error('Le mot de passe doit contenir au moins une minuscule');
      }
      if (!/\d/.test(password)) {
        throw new Error('Le mot de passe doit contenir au moins un chiffre');
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        throw new Error('Le mot de passe doit contenir au moins un caractère spécial');
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
      
      // Créer l'entrée admin_users si l'inscription réussit
      if (data?.user) {
        try {
          const { error: insertError } = await supabase
            .from('admin_users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              is_active: true
            });
          
          if (insertError) {
            console.warn('Erreur création admin_users:', insertError);
          }
        } catch (dbError) {
          console.warn('Erreur base de données lors de l\'inscription:', dbError);
        }
      }
      
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      // Nettoyer les données locales AVANT la déconnexion Supabase
      if (typeof window !== 'undefined') {
        // Nettoyer la session admin
        sessionStorage.removeItem('admin_session');
        sessionStorage.clear();
        localStorage.removeItem('auth_attempts');
        localStorage.removeItem('cookie-consent');
        
        // Nettoyer le cache de l'application
        const cacheKeys = Object.keys(localStorage).filter(key => 
          key.startsWith('cache_') || key.startsWith('supabase.')
        );
        cacheKeys.forEach(key => localStorage.removeItem(key));
      }
      
      // Déconnexion Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.warn('Erreur déconnexion Supabase:', error);
        // Continuer quand même le processus de déconnexion
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      return { error };
    }
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
    initialized: authState.initialized,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
};