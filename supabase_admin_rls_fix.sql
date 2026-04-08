-- ============================================
-- ADMIN PRIVILEGES & SUPPORT FIX
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Ensure the support admin profile exists
INSERT INTO public.profiles (id, full_name, role, email)
VALUES ('db1994ef-754b-469d-9c21-8da397b40245', 'GroupTutors Support', 'admin', 'grouptutorsnew@gmail.com')
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', full_name = 'GroupTutors Support';

-- 2. FIX RLS POLICIES FOR ADMIN ACCESS

-- PROFILES
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- TUTORS
DROP POLICY IF EXISTS "Admins can update all tutors" ON public.tutors;
CREATE POLICY "Admins can update all tutors" ON public.tutors
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can delete tutors" ON public.tutors;
CREATE POLICY "Admins can delete tutors" ON public.tutors
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- MESSAGES
-- Allow admins to see ALL messages for moderation/support
DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;
CREATE POLICY "Admins can view all messages" ON public.messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Ensure base user policies still work (or add them if missing)
-- (They are already in supabase_schema.sql but let's be safe)

-- 3. REFRESH
NOTIFY pgrst, 'reload schema';
