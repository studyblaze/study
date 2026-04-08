-- 1. Create Login/Logout Logs Table
CREATE TABLE IF NOT EXISTS public.auth_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT CHECK (event_type IN ('LOGIN', 'LOGOUT')),
    ip_address TEXT,
    country TEXT,
    timezone TEXT,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for logs
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own logs
DROP POLICY IF EXISTS "Users can view own auth logs" ON public.auth_logs;
CREATE POLICY "Users can view own auth logs" ON public.auth_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all logs
DROP POLICY IF EXISTS "Admins can view all auth logs" ON public.auth_logs;
CREATE POLICY "Admins can view all auth logs" ON public.auth_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 2. Update Profiles table with geo-info
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_ip TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT;

-- 3. Fix Tutor Rejection RLS and Status Constraints
-- Ensure 'rejected' is a valid status and admins can set it
DROP POLICY IF EXISTS "Admins can update all tutors" ON public.tutors;
CREATE POLICY "Admins can update all tutors" 
ON public.tutors FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (true); -- Allow any status update by admin

-- Ensure profiles read is public for location metadata
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" 
ON public.profiles FOR SELECT 
USING (true);
