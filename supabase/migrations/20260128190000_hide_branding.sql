-- Add hide_branding column to page_settings
ALTER TABLE page_settings
ADD COLUMN hide_branding boolean DEFAULT false;
