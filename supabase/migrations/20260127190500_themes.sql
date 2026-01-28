-- Add can_use_themes flag to feature_flags table
ALTER TABLE feature_flags ADD COLUMN IF NOT EXISTS can_use_themes BOOLEAN DEFAULT false;
