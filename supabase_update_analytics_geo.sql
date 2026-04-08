-- Migration: Add geo-location columns to analytics_visits
ALTER TABLE public.analytics_visits 
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS latitude DECIMAL,
ADD COLUMN IF NOT EXISTS longitude DECIMAL;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
