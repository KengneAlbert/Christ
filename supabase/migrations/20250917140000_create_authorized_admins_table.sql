
-- supabase/migrations/20250917140000_create_authorized_admins_table.sql

-- 1. Créer la table pour les administrateurs autorisés
CREATE TABLE public.authorized_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT
);

-- Activer la sécurité au niveau des lignes (RLS)
ALTER TABLE public.authorized_admins ENABLE ROW LEVEL SECURITY;

-- Créer une politique pour permettre la lecture aux utilisateurs authentifiés (admins)
-- Cela permettrait à un super-admin de gérer la liste depuis une interface, par exemple.
CREATE POLICY "Allow authenticated admin read access"
ON public.authorized_admins
FOR SELECT
TO authenticated
USING (true);

-- 2. Insérer les administrateurs existants depuis la liste codée en dur
INSERT INTO public.authorized_admins (email, notes) VALUES
('admin@christlebonberger.fr', 'Compte administrateur principal'),
('suzy.poka@christlebonberger.fr', 'Ajouté depuis la liste initiale'),
('christelle.youeto@christlebonberger.fr', 'Ajouté depuis la liste initiale'),
('florence.noumo@christlebonberger.fr', 'Ajouté depuis la liste initiale'),
('mariette.kom@christlebonberger.fr', 'Ajouté depuis la liste initiale')
ON CONFLICT (email) DO NOTHING;