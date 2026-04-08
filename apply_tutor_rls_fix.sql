-- ============================================
-- TUTOR APPLICATION RLS FIX
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Enable RLS on tutors and profiles (just in case)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;

-- 2. TUTORS TABLE POLICIES

-- Allow users to submit their own application
DROP POLICY IF EXISTS "Users can submit their own application" ON public.tutors;
CREATE POLICY "Users can submit their own application" ON public.tutors
FOR INSERT WITH CHECK (
  auth.uid() = profile_id
);

-- Allow users to update their own application (e.g., if returned/draft)
DROP POLICY IF EXISTS "Users can update their own application" ON public.tutors;
CREATE POLICY "Users can update their own application" ON public.tutors
FOR UPDATE USING (
  auth.uid() = profile_id
);

-- Ensure public/authenticated read remains (matches existing setup)
DROP POLICY IF EXISTS "Public Read Tutors" ON public.tutors;
CREATE POLICY "Public Read Tutors" ON public.tutors
FOR SELECT USING (true);


-- 3. PROFILES TABLE POLICIES

-- Allow users to update THEIR OWN profile (including role column for student -> tutor transition)
DROP POLICY IF EXISTS "Allow individual updates" ON public.profiles;
CREATE POLICY "Allow individual updates" ON public.profiles
FOR UPDATE USING (
  auth.uid() = id
)
WITH CHECK (
  auth.uid() = id
);

-- Ensure admins can still do everything (from admin_rls_fix)
-- (This should already exist if the user ran previous admin fix scripts)

NOTIFY pgrst, 'reload schema';
