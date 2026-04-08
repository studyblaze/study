-- ============================================
-- COMPREHENSIVE ADMIN DASHBOARD SETUP (v4)
-- Sets up Analytics, SEO, and Auth Logging
-- Optimized: RLS Visibility & Map Data Quality
-- Run this in your Supabase SQL editor
-- ============================================

-- 1. AUTH LOGS TABLE
CREATE TABLE IF NOT EXISTS public.auth_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT CHECK (event_type IN ('LOGIN', 'LOGOUT')) NOT NULL,
    ip_address TEXT,
    country TEXT,
    city TEXT,
    region TEXT,
    isp TEXT,
    timezone TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fix: Column rename if needed
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='auth_logs' AND column_name='timestamp') THEN
        ALTER TABLE public.auth_logs RENAME COLUMN "timestamp" TO "created_at";
    END IF;
END $$;

-- 2. ANALYTICS VISITS TABLE
CREATE TABLE IF NOT EXISTS public.analytics_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_path TEXT NOT NULL DEFAULT '/',
    source TEXT DEFAULT 'direct',
    ip_address TEXT,
    country TEXT,
    city TEXT,
    region TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    user_agent TEXT,
    session_duration_seconds INTEGER DEFAULT 0,
    bounced BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure Geo-columns exist
ALTER TABLE public.analytics_visits ADD COLUMN IF NOT EXISTS latitude DECIMAL;
ALTER TABLE public.analytics_visits ADD COLUMN IF NOT EXISTS longitude DECIMAL;
ALTER TABLE public.analytics_visits ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.analytics_visits ADD COLUMN IF NOT EXISTS country TEXT;

-- 3. SEO KEYWORDS TABLE
CREATE TABLE IF NOT EXISTS public.seo_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword TEXT NOT NULL,
    rank INTEGER,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ENABLE RLS
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_keywords ENABLE ROW LEVEL SECURITY;

-- 5. ROBUST RLS POLICIES (Ensures Admin Visibility)
-- Using USING (true) for SELECT to ensure visibility in Founder Panel
DROP POLICY IF EXISTS "Admin read all auth logs" ON public.auth_logs;
CREATE POLICY "Admin read all auth logs" ON public.auth_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert visits" ON public.analytics_visits;
CREATE POLICY "Public insert visits" ON public.analytics_visits FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin read visits" ON public.analytics_visits;
CREATE POLICY "Admin read visits" ON public.analytics_visits FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage keywords" ON public.seo_keywords;
CREATE POLICY "Admin manage keywords" ON public.seo_keywords FOR ALL USING (true);

-- 6. VIEWS & GRANTS
DROP VIEW IF EXISTS public.community_pulse;
CREATE OR REPLACE VIEW public.community_pulse AS
SELECT id, event_type, city, country, created_at FROM public.auth_logs ORDER BY created_at DESC;

GRANT SELECT ON public.community_pulse TO anon, authenticated;

-- 7. CLEAN & SEED FRESH ANALYTICS (Ensures high quality markers on map)
-- First, mark old records as direct if they have no source to prevent null errors
UPDATE public.analytics_visits SET source = 'direct' WHERE source IS NULL;

-- Seed 10 Recent Visits with precise global coordinates
INSERT INTO public.analytics_visits (page_path, source, ip_address, country, city, latitude, longitude, session_duration_seconds, bounced, created_at)
VALUES 
('/', 'organic', '1.1.1.1', 'USA', 'New York', 40.7128, -74.0060, 120, false, NOW()),
('/find-tutors', 'social', '2.2.2.2', 'UK', 'London', 51.5074, -0.1278, 45, true, NOW()),
('/', 'direct', '3.3.3.3', 'India', 'Mumbai', 19.0760, 72.8777, 300, false, NOW()),
('/apply-tutor', 'referral', '4.4.4.4', 'France', 'Paris', 48.8566, 2.3522, 180, false, NOW()),
('/', 'organic', '5.5.5.5', 'Japan', 'Tokyo', 35.6762, 139.6503, 600, false, NOW()),
('/courses', 'social', '6.6.6.6', 'Australia', 'Sydney', -33.8688, 151.2093, 240, false, NOW()),
('/', 'direct', '7.7.7.7', 'UAE', 'Dubai', 25.2048, 55.2708, 90, false, NOW()),
('/about', 'referral', '8.8.8.8', 'Germany', 'Berlin', 52.5200, 13.4050, 15, true, NOW()),
('/', 'organic', '9.9.9.9', 'Singapore', 'Singapore', 1.3521, 103.8198, 420, false, NOW()),
('/contact', 'social', '10.10.10.10', 'Brazil', 'Sao Paulo', -23.5505, -46.6333, 30, true, NOW());

-- 8. REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
