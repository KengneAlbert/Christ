/*
  # Insert sample data for testing

  1. Sample Data
    - Sample media items for testing the mediatheque
    - Various types: video, document, audio, image
    - Published items for public viewing

  2. Notes
    - Uses placeholder data with real image URLs from Pexels
    - Creates diverse content for testing filters and search
*/

-- Insert sample media items
INSERT INTO media_items (
  type, title, description, category, thumbnail_url, file_url, youtube_id, 
  is_published, views_count, downloads_count
) VALUES 
(
  'video'::media_type,
  'Témoignage de Marie - Sortir de la violence conjugale',
  'Marie partage son parcours de reconstruction après avoir quitté une relation violente. Un témoignage fort et inspirant pour toutes les femmes qui traversent cette épreuve.',
  'Témoignages',
  'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800',
  null,
  'dQw4w9WgXcQ',
  true,
  245,
  0
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
  67
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
  23
),
(
  'image'::media_type,
  'Infographie - Les signaux d\'alarme',
  'Une infographie claire qui présente les principaux signaux d\'alarme dans une relation. Outil de sensibilisation et de prévention.',
  'Prévention',
  'https://images.pexels.com/photos/590022/pexels-photo-590022.jpg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/590022/pexels-photo-590022.jpg?auto=compress&cs=tinysrgb&w=1260',
  null,
  true,
  312,
  89
),
(
  'video'::media_type,
  'Conférence - Accompagner une proche victime de violence',
  'Comment aider et soutenir une personne proche victime de violence conjugale ? Les bons réflexes et les erreurs à éviter.',
  'Formation',
  'https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=800',
  null,
  'ScMzIvxBSi4',
  true,
  98,
  0
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
  145
),
(
  'audio'::media_type,
  'Méditation guidée - Apaiser l\'anxiété',
  'Une séance de méditation de 15 minutes spécialement conçue pour apaiser l\'anxiété et retrouver un sentiment de sécurité intérieure.',
  'Bien-être',
  'https://images.pexels.com/photos/7176319/pexels-photo-7176319.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
  null,
  true,
  87,
  34
),
(
  'image'::media_type,
  'Carte des ressources locales',
  'Carte interactive des associations, centres d\'hébergement et services d\'aide disponibles dans votre région.',
  'Ressources',
  'https://images.pexels.com/photos/590022/pexels-photo-590022.jpg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/590022/pexels-photo-590022.jpg?auto=compress&cs=tinysrgb&w=1260',
  null,
  true,
  167,
  52
);