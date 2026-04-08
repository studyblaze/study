-- ============================================
-- FINAL TUTOR APPLICATION RLS FIX
-- Run this in Supabase SQL Editor to resolve "new row violates row-level security policy"
-- ============================================

-- 1. Enable RLS on core tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;

-- 2. TUTORS TABLE POLICIES

-- Allow users to submit their own application (profile_id must match auth.uid)
DROP POLICY IF EXISTS "Users can submit their own application" ON public.tutors;
CREATE POLICY "Users can submit their own application" ON public.tutors
FOR INSERT WITH CHECK (
  auth.uid() = profile_id
);

-- Allow users to update their own application
DROP POLICY IF EXISTS "Users can update their own application" ON public.tutors;
CREATE POLICY "Users can update their own application" ON public.tutors
FOR UPDATE USING (
  auth.uid() = profile_id
);

-- Allow users to view their own application (even if pending)
DROP POLICY IF EXISTS "Users can view their own application" ON public.tutors;
CREATE POLICY "Users can view their own application" ON public.tutors
FOR SELECT USING (
  auth.uid() = profile_id
);

-- Keep public visibility for verified tutors (assuming this is needed for searching)
DROP POLICY IF EXISTS "Public Read Tutors" ON public.tutors;
CREATE POLICY "Public Read Tutors" ON public.tutors
FOR SELECT USING (
  verification_status = 'verified' OR auth.uid() = profile_id
);

-- 3. PROFILES TABLE POLICIES

-- Ensure users can update their own role (e.g., student -> tutor)
DROP POLICY IF EXISTS "Allow individual updates" ON public.profiles;
CREATE POLICY "Allow individual updates" ON public.profiles
FOR UPDATE USING (
  auth.uid() = id
)
WITH CHECK (
  auth.uid() = id
);

-- Ensure admins have full access to everything
DROP POLICY IF EXISTS "Admins have full access to tutors" ON public.tutors;
CREATE POLICY "Admins have full access to tutors" ON public.tutors
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Final instruction to reload schema (ProstagREST cache)
NOTIFY pgrst, 'reload schema';
