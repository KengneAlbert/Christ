import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer la session actuelle
    const getSession = async () => {
      try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Erreur récupération session:', error);
        setUser(null);
      } finally {
        setLoading(false);
        setLoading(false);
      }
        // Mettre à jour la dernière connexion
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            await supabase
              .from('admin_users')
              .update({ last_login: new Date().toISOString() })
              .eq('id', session.user.id);
          } catch (error) {
            console.error('Erreur mise à jour dernière connexion:', error);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin/confirm`
      }
    });

    if (error) throw error;

    // Créer l'entrée admin_users
    if (data.user) {
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          is_active: false // Sera activé après confirmation email
        });

      if (insertError) {
        console.error('Erreur création admin_user:', insertError);
      }
    }

    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`
    });
    if (error) throw error;
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword
  };
};