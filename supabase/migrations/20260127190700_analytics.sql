-- Create analytics_events table for tracking page views and link clicks
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'page_view', 'link_click'
  referrer TEXT,
  user_agent TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  browser TEXT,
  os TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for efficient querying
CREATE INDEX idx_analytics_profile_id ON analytics_events(profile_id);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_link_id ON analytics_events(link_id) WHERE link_id IS NOT NULL;

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- Users can view their own analytics
CREATE POLICY "Users can view own analytics"
  ON analytics_events FOR SELECT
  USING (profile_id = auth.uid());

-- Allow anonymous inserts for tracking (we'll validate via server actions)
CREATE POLICY "Allow anonymous inserts"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

-- Add is_featured column to links table
ALTER TABLE links ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Add can_use_featured_links flag
ALTER TABLE feature_flags ADD COLUMN IF NOT EXISTS can_use_featured_links BOOLEAN DEFAULT false;
