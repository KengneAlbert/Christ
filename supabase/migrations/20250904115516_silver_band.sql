/*
  # Create media items table

  1. New Tables
    - `media_items`
      - `id` (uuid, primary key)
      - `type` (enum: video, document, audio, image)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `thumbnail_url` (text, nullable)
      - `file_url` (text, nullable)
      - `youtube_id` (text, nullable)
      - `file_name` (text, nullable)
      - `file_size` (bigint, nullable)
      - `duration` (text, nullable)
      - `pages` (integer, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `is_published` (boolean, default false)
      - `views_count` (integer, default 0)
      - `downloads_count` (integer, default 0)
      - `created_by` (uuid, foreign key to admin_users)

  2. Security
    - Enable RLS on `media_items` table
    - Add policy for public read access to published items
    - Add policy for authenticated admin users to manage items
*/

-- Create enum type for media types
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_media_items_type ON media_items(type);
CREATE INDEX IF NOT EXISTS idx_media_items_category ON media_items(category);
CREATE INDEX IF NOT EXISTS idx_media_items_published ON media_items(is_published);
CREATE INDEX IF NOT EXISTS idx_media_items_created_at ON media_items(created_at);

-- Enable RLS
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to published items
CREATE POLICY "Public can read published media items"
  ON media_items
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- Policy for authenticated admin users to manage all items
CREATE POLICY "Admin users can manage media items"
  ON media_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_media_items_updated_at ON media_items;
CREATE TRIGGER update_media_items_updated_at
  BEFORE UPDATE ON media_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();