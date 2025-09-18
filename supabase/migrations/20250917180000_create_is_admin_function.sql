-- supabase/migrations/20250917180000_create_is_admin_function.sql

-- Cette fonction vérifie si l'utilisateur actuellement authentifié est un administrateur.
-- Elle est marquée comme `SECURITY DEFINER` pour lui permettre de lire la table `authorized_admins` avec des privilèges élevés.
-- C'est une méthode sécurisée et très performante pour vérifier les permissions dans les politiques RLS.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
-- Définit un search_path sécurisé pour la fonction
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.authorized_admins
    WHERE email = auth.email()
  );
$$;
