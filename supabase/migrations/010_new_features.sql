-- Migration 010: New Features (Cover Images, Social Links, Lead Gate, YouTube Header)
-- Execute this SQL manually in Supabase SQL Editor

-- =====================================================
-- 1. ADD NEW COLUMNS TO EXISTING TABLES
-- =====================================================

-- Links: cover image and lead gate
ALTER TABLE links ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE links ADD COLUMN IF NOT EXISTS requires_email BOOLEAN DEFAULT false;

-- Page settings: video header and social icons position
ALTER TABLE page_settings ADD COLUMN IF NOT EXISTS header_video_url TEXT;
ALTER TABLE page_settings ADD COLUMN IF NOT EXISTS social_icons_position TEXT DEFAULT 'hidden';

-- =====================================================
-- 2. NEW FEATURE FLAGS
-- =====================================================

ALTER TABLE feature_flags
  ADD COLUMN IF NOT EXISTS can_use_link_cover_images BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_use_social_buttons BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_use_lead_gate BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_use_header_video BOOLEAN DEFAULT false;

-- =====================================================
-- 3. CREATE SOCIAL_LINKS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for social_links
CREATE INDEX IF NOT EXISTS social_links_profile_id_idx ON social_links(profile_id);
CREATE INDEX IF NOT EXISTS social_links_position_idx ON social_links(profile_id, position);

-- Enable RLS on social_links
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for social_links
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Social links are publicly viewable" ON social_links;
  DROP POLICY IF EXISTS "Users can insert their own social links" ON social_links;
  DROP POLICY IF EXISTS "Users can update their own social links" ON social_links;
  DROP POLICY IF EXISTS "Users can delete their own social links" ON social_links;
END $$;

CREATE POLICY "Social links are publicly viewable"
  ON social_links FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own social links"
  ON social_links FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own social links"
  ON social_links FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own social links"
  ON social_links FOR DELETE
  USING (auth.uid() = profile_id);

-- Trigger for updated_at on social_links (reuse existing function if available)
DROP TRIGGER IF EXISTS social_links_updated_at ON social_links;
CREATE TRIGGER social_links_updated_at
  BEFORE UPDATE ON social_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- 4. CREATE STORAGE BUCKET FOR COVER IMAGES
-- =====================================================

-- Insert storage bucket for link cover images (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('link-covers', 'link-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for link-covers bucket
DO $$
BEGIN
  DROP POLICY IF EXISTS "Link cover images are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own link covers" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own link covers" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own link covers" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Link cover images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'link-covers');

CREATE POLICY "Users can upload their own link covers"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'link-covers'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own link covers"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'link-covers'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own link covers"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'link-covers'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
