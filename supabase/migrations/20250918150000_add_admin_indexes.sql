-- Activer l’extension trigrammes
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Media items
CREATE INDEX IF NOT EXISTS idx_media_items_title_trgm
  ON media_items USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_media_items_type
  ON media_items (type);
CREATE INDEX IF NOT EXISTS idx_media_items_created_at
  ON media_items (created_at DESC);

-- Newsletter subscribers
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email_trgm
  ON newsletter_subscribers USING gin (email gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_is_active
  ON newsletter_subscribers (is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscription_date
  ON newsletter_subscribers (subscription_date DESC);

-- Newsletters
CREATE INDEX IF NOT EXISTS idx_newsletters_created_at
  ON newsletters (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletters_status
  ON newsletters (status);
CREATE INDEX IF NOT EXISTS idx_newsletters_category
  ON newsletters (category);
