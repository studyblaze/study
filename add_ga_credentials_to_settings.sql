
-- Add Google Analytics 4 credentials to site_settings table
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS ga_property_id TEXT,
ADD COLUMN IF NOT EXISTS ga_client_email TEXT,
ADD COLUMN IF NOT EXISTS ga_private_key TEXT;

-- Update the existing row with the discovered Property ID and Service Account email as defaults
-- We leave the private key null for the user to paste in the UI
UPDATE public.site_settings 
SET 
  ga_property_id = COALESCE(ga_property_id, '526628970'),
  ga_client_email = COALESCE(ga_client_email, 'grouptutors-analytics@exkgplqcdtoxfmxqkdpl.iam.gserviceaccount.com')
WHERE id = 1;
