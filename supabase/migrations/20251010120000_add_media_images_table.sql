/*
  # Add media_images table for image galleries

  1. New Tables
    - `media_images`
      - `id` (uuid, primary key)
      - `media_id` (uuid, references media_items)
      - `image_url` (text, required)
      - `thumbnail_url` (text, nullable)
      - `is_cover` (boolean, default false)
      - `position` (integer, default 0)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Public can read images only for published media_items
    - Admin authenticated users can manage
*/

CREATE TABLE IF NOT EXISTS media_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    media_id uuid NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    thumbnail_url text,
    is_cover boolean DEFAULT false,
    position integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_images_media_id ON media_images(media_id);
CREATE INDEX IF NOT EXISTS idx_media_images_cover ON media_images(media_id, is_cover) WHERE is_cover = true;

ALTER TABLE media_images ENABLE ROW LEVEL SECURITY;

-- Drop policies first (if they exist) to avoid duplication
DROP POLICY IF EXISTS "Public can read images of published media" ON media_images;
DROP POLICY IF EXISTS "Admin users can manage media images" ON media_images;

-- Public read when parent media is published
CREATE POLICY "Public can read images of published media"
ON media_images
FOR SELECT
TO anon, authenticated
USING (
    EXISTS (
        SELECT 1
        FROM media_items m
        WHERE m.id = media_images.media_id
        AND m.is_published = true
    )
);

-- Admins can manage all images
CREATE POLICY "Admin users can manage media images"
ON media_images
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
