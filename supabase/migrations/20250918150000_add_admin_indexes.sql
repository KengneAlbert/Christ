-- Optimize queries used by admin pages
-- Media items: search by title, filter by type, order by created_at
create index if not exists idx_media_items_title_trgm on media_items using gin (title gin_trgm_ops);
create index if not exists idx_media_items_type on media_items (type);
create index if not exists idx_media_items_created_at on media_items (created_at desc);

-- Newsletter subscribers: search by email, filter by is_active, order by subscription_date
create index if not exists idx_newsletter_subscribers_email_trgm on newsletter_subscribers using gin (email gin_trgm_ops);
create index if not exists idx_newsletter_subscribers_is_active on newsletter_subscribers (is_active);
create index if not exists idx_newsletter_subscribers_subscription_date on newsletter_subscribers (subscription_date desc);

-- Newsletters: order by created_at, filter by status/category sometimes
create index if not exists idx_newsletters_created_at on newsletters (created_at desc);
create index if not exists idx_newsletters_status on newsletters (status);
create index if not exists idx_newsletters_category on newsletters (category);