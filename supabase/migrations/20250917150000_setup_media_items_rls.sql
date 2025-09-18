-- supabase/migrations/YYYYMMDDHHMMSS_setup_media_items_rls.sql

-- 1. Activer RLS sur la table media_items
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

-- 2. Créer une politique pour autoriser la lecture publique (SELECT)
-- Tout le monde (anonyme et authentifié) peut voir les médias publiés.
CREATE POLICY "Allow public read access to published media" 
ON public.media_items
FOR SELECT
USING (is_published = true);

-- 3. Créer une politique pour autoriser les administrateurs à tout faire (INSERT, SELECT, UPDATE, DELETE)
-- On vérifie que l'utilisateur authentifié existe dans la table des administrateurs autorisés.
CREATE POLICY "Allow full access for authorized admins" 
ON public.media_items
FOR ALL
USING (public.is_admin());

-- Note : La politique ci-dessus suppose que la colonne `id` de `authorized_admins` 
-- correspond à l'ID utilisateur de `auth.users`. Si ce n'est pas le cas, 
-- il faudrait une jointure sur l'email ou une fonction qui renvoie le rôle de l'utilisateur.
-- Pour cet exemple, nous partons du principe qu'une correspondance d'ID est possible ou sera mise en place.

-- Alternative si la correspondance se fait par email :
-- CREATE POLICY "Allow full access for authorized admins via email" 
-- ON public.media_items
-- FOR ALL
-- USING (auth.email() IN (SELECT email FROM public.authorized_admins));
