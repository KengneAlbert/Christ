import { useState, useEffect } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

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
      // Vérifier si l'email est autorisé pour l'inscription admin
      const authorizedEmails = [
        'admin@christlebonberger.fr',
        'suzy.poka@christlebonberger.fr',
        'christelle.youeto@christlebonberger.fr',
        'florence.noumo@christlebonberger.fr',
        'mariette.kom@christlebonberger.fr'
      ];
      
      const authorizedDomains = ['christlebonberger.fr'];
      const domain = email.split('@')[1]?.toLowerCase();
      
      const isAuthorized = authorizedEmails.includes(email.toLowerCase()) || 
                          authorizedDomains.includes(domain);
      
      if (!isAuthorized) {
        throw new Error('Cette adresse email n\'est pas autorisée pour l\'inscription admin');
      }
      
      // Validation du mot de passe
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
        sessionStorage.clear();
        localStorage.removeItem('auth_attempts');
        localStorage.removeItem('auth_session');
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
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
};