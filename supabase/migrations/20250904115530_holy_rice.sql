/*
  # Create newsletters table

  1. New Tables
    - `newsletters`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `html_content` (text, nullable)
      - `category` (enum: actualites, temoignages, evenements, ressources)
      - `status` (enum: draft, scheduled, sent)
      - `scheduled_date` (timestamp, nullable)
      - `sent_date` (timestamp, nullable)
      - `recipients_count` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid, foreign key to admin_users)

  2. Security
    - Enable RLS on `newsletters` table
    - Add policy for authenticated admin users to manage newsletters
*/

-- Create enum types
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_newsletters_category ON newsletters(category);
CREATE INDEX IF NOT EXISTS idx_newsletters_status ON newsletters(status);
CREATE INDEX IF NOT EXISTS idx_newsletters_created_at ON newsletters(created_at);

-- Enable RLS
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated admin users to manage newsletters
CREATE POLICY "Admin users can manage newsletters"
  ON newsletters
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_newsletters_updated_at ON newsletters;
CREATE TRIGGER update_newsletters_updated_at
  BEFORE UPDATE ON newsletters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();