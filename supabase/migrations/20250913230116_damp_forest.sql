/*
  # Migration complète pour initialiser le schéma de la base de données

  1. Tables créées
    - `admin_users` - Utilisateurs administrateurs
    - `media_items` - Éléments de la médiathèque
    - `newsletter_subscribers` - Abonnés à la newsletter
    - `newsletters` - Archives des newsletters

  2. Types ENUM
    - `media_type` - Types de médias (video, document, audio, image)
    - `newsletter_category` - Catégories de newsletters
    - `newsletter_status` - Statuts des newsletters

  3. Sécurité
    - RLS activé sur toutes les tables
    - Politiques d'accès appropriées
    - Triggers pour mise à jour automatique

  4. Données d'exemple
    - Médias de test pour la médiathèque
    - Contenu varié pour tester les fonctionnalités
*/

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- TABLE: admin_users
-- =============================================

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz,
  is_active boolean DEFAULT true
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can read own data"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin users can update own data"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- =============================================
-- TABLE: media_items
-- =============================================

-- Créer le type ENUM pour les types de médias
DO $$ BEGIN
  CREATE TYPE media_type AS ENUM ('video', 'document', 'audio', 'image');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS media_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type media_type NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  thumbnail_url text,
  file_url text,
  youtube_id text,
  file_name text,
  file_size bigint,
  duration text,
  pages integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_published boolean DEFAULT false,
  views_count integer DEFAULT 0,
  downloads_count integer DEFAULT 0,
  created_by uuid REFERENCES admin_users(id)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_media_items_type ON media_items(type);
CREATE INDEX IF NOT EXISTS idx_media_items_category ON media_items(category);
CREATE INDEX IF NOT EXISTS idx_media_items_published ON media_items(is_published);
CREATE INDEX IF NOT EXISTS idx_media_items_created_at ON media_items(created_at);

-- RLS et politiques
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published media items"
  ON media_items
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admin users can manage media items"
  ON media_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_media_items_updated_at ON media_items;
CREATE TRIGGER update_media_items_updated_at
  BEFORE UPDATE ON media_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TABLE: newsletter_subscribers
-- =============================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  subscription_date timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  preferences jsonb DEFAULT '{"actualites": true, "temoignages": true, "evenements": true, "ressources": true}'::jsonb,
  unsubscribe_token text UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex')
);

-- Index
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON newsletter_subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_token ON newsletter_subscribers(unsubscribe_token);

-- RLS et politiques
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can manage newsletter subscribers"
  ON newsletter_subscribers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- =============================================
-- TABLE: newsletters
-- =============================================

-- Types ENUM pour les newsletters
DO $$ BEGIN
  CREATE TYPE newsletter_category AS ENUM ('actualites', 'temoignages', 'evenements', 'ressources');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE newsletter_status AS ENUM ('draft', 'scheduled', 'sent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS newsletters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  html_content text,
  category newsletter_category NOT NULL,
  status newsletter_status DEFAULT 'draft',
  scheduled_date timestamptz,
  sent_date timestamptz,
  recipients_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES admin_users(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_newsletters_category ON newsletters(category);
CREATE INDEX IF NOT EXISTS idx_newsletters_status ON newsletters(status);
CREATE INDEX IF NOT EXISTS idx_newsletters_created_at ON newsletters(created_at);

-- RLS et politiques
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can manage newsletters"
  ON newsletters
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_newsletters_updated_at ON newsletters;
CREATE TRIGGER update_newsletters_updated_at
  BEFORE UPDATE ON newsletters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DONNÉES D'EXEMPLE
-- =============================================

-- Insérer des médias d'exemple
INSERT INTO media_items (
  type, title, description, category, thumbnail_url, file_url, youtube_id, 
  is_published, views_count, downloads_count, duration, pages
) VALUES 
(
  'video'::media_type,
  'Témoignage de Marie - Sortir de la violence conjugale',
  'Marie partage son parcours de reconstruction après avoir quitté une relation violente. Un témoignage fort et inspirant pour toutes les femmes qui traversent cette épreuve.',
  'Témoignages',
  'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'dQw4w9WgXcQ',
  true,
  245,
  0,
  '12:34',
  null
),
(
  'document'::media_type,
  'Guide pratique - Vos droits en cas de violence conjugale',
  'Un guide complet qui explique vos droits, les démarches à entreprendre et les ressources disponibles. Document essentiel pour comprendre les options légales.',
  'Guides juridiques',
  'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  null,
  true,
  189,
  67,
  null,
  24
),
(
  'audio'::media_type,
  'Podcast - Reconstruire sa confiance en soi',
  'Un épisode dédié aux techniques pour retrouver confiance et estime de soi après une relation toxique. Avec des conseils pratiques de psychologues spécialisés.',
  'Développement personnel',
  'https://images.pexels.com/photos/7176319/pexels-photo-7176319.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
  null,
  true,
  156,
  23,
  '45:12',
  null
),
(
  'image'::media_type,
  'Infographie - Les signaux d''alarme',
  'Une infographie claire qui présente les principaux signaux d''alarme dans une relation. Outil de sensibilisation et de prévention.',
  'Prévention',
  'https://images.pexels.com/photos/590022/pexels-photo-590022.jpg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/590022/pexels-photo-590022.jpg?auto=compress&cs=tinysrgb&w=1260',
  null,
  true,
  312,
  89,
  null,
  null
),
(
  'video'::media_type,
  'Conférence - Accompagner une proche victime de violence',
  'Comment aider et soutenir une personne proche victime de violence conjugale ? Les bons réflexes et les erreurs à éviter.',
  'Formation',
  'https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://www.youtube.com/watch?v=ScMzIvxBSi4',
  'ScMzIvxBSi4',
  true,
  98,
  0,
  '1:23:45',
  null
),
(
  'document'::media_type,
  'Fiche pratique - Préparer son départ en sécurité',
  'Liste de vérification et conseils pratiques pour préparer un départ en toute sécurité. Inclut les documents importants à rassembler.',
  'Sécurité',
  'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  null,
  true,
  203,
  145,
  null,
  8
),
(
  'audio'::media_type,
  'Méditation guidée - Apaiser l''anxiété',
  'Une séance de méditation de 15 minutes spécialement conçue pour apaiser l''anxiété et retrouver un sentiment de sécurité intérieure.',
  'Bien-être',
  'https://images.pexels.com/photos/7176319/pexels-photo-7176319.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
  null,
  true,
  87,
  34,
  '15:00',
  null
),
(
  'image'::media_type,
  'Carte des ressources locales',
  'Carte interactive des associations, centres d''hébergement et services d''aide disponibles dans votre région.',
  'Ressources',
  'https://images.pexels.com/photos/590022/pexels-photo-590022.jpg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/590022/pexels-photo-590022.jpg?auto=compress&cs=tinysrgb&w=1260',
  null,
  true,
  167,
  52,
  null,
  null
);