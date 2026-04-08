-- consolidated_setup.sql
-- Run this in the Supabase SQL Editor to ensure your database is fully set up.

-- 1. Create PROFILES table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  role TEXT CHECK (role IN ('student', 'tutor', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create TUTORS table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.tutors (
  id SERIAL PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) UNIQUE,
  subject TEXT,
  bio TEXT,
  hourly_rate DECIMAL,
  rating DECIMAL DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  earnings DECIMAL DEFAULT 0
);

-- 3. Add Enhancement Columns (Ensures they exist if table was already there)
ALTER TABLE public.tutors 
ADD COLUMN IF NOT EXISTS verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS application_data JSONB,
ADD COLUMN IF NOT EXISTS identity_docs_url TEXT,
ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Sync verification_status with legacy is_verified
UPDATE public.tutors 
SET verification_status = 'verified' 
WHERE is_verified = TRUE AND verification_status = 'pending';

-- 5. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;

-- 6. Policies (Drops first to avoid "already exists" errors)
DROP POLICY IF EXISTS "Public Read Tutors" ON public.tutors;
CREATE POLICY "Public Read Tutors" ON public.tutors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update everything" ON public.tutors;
CREATE POLICY "Admins can update everything" ON public.tutors 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Tutors can update own profile" ON public.tutors;
CREATE POLICY "Tutors can update own profile" ON public.tutors
FOR UPDATE USING (auth.uid() = (SELECT profile_id FROM public.tutors WHERE id = tutors.id));
