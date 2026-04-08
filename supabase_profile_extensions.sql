-- ============================================
-- PROFILE EXTENSIONS FOR GOOGLE CALENDAR & 2FA
-- Run in Supabase SQL Editor
-- ============================================

-- 1. Add calendar sync columns to profiles table
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS calendar_connected BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS google_calendar_token TEXT,
    ADD COLUMN IF NOT EXISTS google_calendar_refresh_token TEXT;

-- 2. Index for calendar queries
CREATE INDEX IF NOT EXISTS idx_profiles_calendar ON public.profiles(calendar_connected) WHERE calendar_connected = TRUE;

-- 3. Allow logged-in users to update their own calendar status (needed for OAuth callback)
DROP POLICY IF EXISTS "Allow calendar update" ON public.profiles;
CREATE POLICY "Allow calendar update" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ============================================
-- ENABLE MFA IN SUPABASE (Do this in Dashboard)
-- ============================================
-- Go to: Supabase Dashboard → Authentication → Multi-Factor Authentication
-- Toggle ON: "TOTP (Authenticator App)"
-- This enables supabase.auth.mfa.enroll() to work.
-- ============================================

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
