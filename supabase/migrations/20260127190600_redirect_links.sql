-- Add redirect link fields to page_settings
ALTER TABLE page_settings ADD COLUMN IF NOT EXISTS redirect_url TEXT;
ALTER TABLE page_settings ADD COLUMN IF NOT EXISTS redirect_until TIMESTAMPTZ;

-- Add feature flag for redirect links
ALTER TABLE feature_flags ADD COLUMN IF NOT EXISTS can_use_redirect_links BOOLEAN DEFAULT false;
