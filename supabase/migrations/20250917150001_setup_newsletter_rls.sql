-- supabase/migrations/20250917150001_setup_newsletter_rls.sql

-- 1. Activer RLS sur la table newsletter_subscribers
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- 2. Activer RLS sur la table newsletters
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;

-- --- Politiques pour la table `newsletter_subscribers` ---

-- 3. Créer une politique pour autoriser l'insertion publique (abonnement)
-- N'importe qui doit pouvoir s'inscrire à la newsletter.
CREATE POLICY "Allow public insert for new subscribers" 
ON public.newsletter_subscribers
FOR INSERT
WITH CHECK (true);

-- 4. Créer une politique pour autoriser les administrateurs à lire et supprimer les abonnés
CREATE POLICY "Allow admins to read and delete subscribers" 
ON public.newsletter_subscribers
FOR SELECT, DELETE
USING (public.is_admin());

-- 5. Créer une politique pour autoriser un utilisateur à gérer son propre abonnement (UPDATE)
-- C'est une bonne pratique, même si ce n'est pas encore implémenté dans l'UI.
-- `uid()` doit correspondre à une colonne `user_id` dans la table des abonnés.
-- Supposons que vous ajoutiez une colonne `user_id UUID` qui référence `auth.users(id)`.
-- ALTER TABLE public.newsletter_subscribers ADD COLUMN user_id UUID REFERENCES auth.users(id);
-- CREATE POLICY "Allow user to update their own subscription" 
-- ON public.newsletter_subscribers
-- FOR UPDATE
-- USING (auth.uid() = user_id);


-- --- Politiques pour la table `newsletters` ---

-- 6. Créer une politique pour autoriser les administrateurs à tout faire
CREATE POLICY "Allow full access for admins on newsletters" 
ON public.newsletters
FOR ALL
USING (public.is_admin());
