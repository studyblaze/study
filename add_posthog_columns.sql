-- Add PostHog columns to site_settings
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS ph_project_api_key TEXT,
ADD COLUMN IF NOT EXISTS ph_personal_api_key TEXT,
ADD COLUMN IF NOT EXISTS ph_project_id TEXT,
ADD COLUMN IF NOT EXISTS ph_host TEXT DEFAULT 'https://app.posthog.com';

-- Update the existing record if needed (assuming ID 1)
-- UPDATE site_settings SET ph_host = 'https://app.posthog.com' WHERE id = 1;
