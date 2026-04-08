-- ============================================
-- AUTHENTICATION LOGGING SETUP
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

-- 2. ENABLE RLS
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES
-- Admin can see all logs
DROP POLICY IF EXISTS "Admin read all auth logs" ON public.auth_logs;
CREATE POLICY "Admin read all auth logs" ON public.auth_logs FOR SELECT
USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Users can see their own logs
DROP POLICY IF EXISTS "Users read own auth logs" ON public.auth_logs;
CREATE POLICY "Users read own auth logs" ON public.auth_logs FOR SELECT
USING (auth.uid() = user_id);

-- 4. VIEW FOR "EVERYONE" (Public-facing anonymized events if requested)
-- If you want a public "Pulse" feed, you can use this view to hide specific user IDs
CREATE OR REPLACE VIEW public.community_pulse AS
SELECT 
    id,
    event_type,
    city,
    country,
    created_at
FROM public.auth_logs
ORDER BY created_at DESC
LIMIT 50;

-- Allow public read of the pulse view
GRANT SELECT ON public.community_pulse TO anon, authenticated;

-- 5. REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
