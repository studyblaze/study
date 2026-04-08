-- ============================================
-- THE ULTIMATE SUPABASE FIX (TABLES + STORAGE)
-- Run this to fix ALL "new row violates row-level security policy" errors
-- ============================================

-- I. BUCKET SETUP
-- Ensure the buckets used in ApplyTutorPage.tsx exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tutor-docs', 'tutor-docs', true), ('intro-videos', 'intro-videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- II. STORAGE RLS (Clear and Recreate)
-- This allows anyone logged in to upload to these specific buckets
DROP POLICY IF EXISTS "Allow Authenticated Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Allow Individual Management" ON storage.objects;

CREATE POLICY "Allow Authenticated Uploads" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id IN ('tutor-docs', 'intro-videos'));

CREATE POLICY "Allow Public Read" 
ON storage.objects FOR SELECT 
USING (bucket_id IN ('tutor-docs', 'intro-videos'));

CREATE POLICY "Allow Individual Management" 
ON storage.objects FOR ALL 
TO authenticated 
USING (bucket_id IN ('tutor-docs', 'intro-videos') AND (auth.uid()::text = (storage.foldername(name))[1]));

-- III. TABLES RLS (Nuclear Wipe and Re-apply)
-- 1. Wipe all existing policies on tutors and profiles
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('tutors', 'profiles')) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 2. Ensure RLS is enabled
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create a non-recursive Admin Check Function
CREATE OR REPLACE FUNCTION public.is_admin_v4()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create the SECURE Profile ID Trigger
CREATE OR REPLACE FUNCTION public.force_profile_id_v4()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    NEW.profile_id := auth.uid();
  END IF;
  IF NEW.verification_status IS NULL THEN
    NEW.verification_status := 'pending';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_force_profile_id ON public.tutors;
CREATE TRIGGER tr_force_profile_id
  BEFORE INSERT ON public.tutors
  FOR EACH ROW EXECUTE FUNCTION public.force_profile_id_v4();

-- 5. RE-APPLY CLEAN TABLE POLICIES
CREATE POLICY "permissive_insert_tutors" ON public.tutors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "permissive_select_tutors" ON public.tutors FOR SELECT TO authenticated USING (auth.uid() = profile_id OR verification_status = 'verified' OR is_admin_v4());
CREATE POLICY "permissive_update_tutors" ON public.tutors FOR UPDATE TO authenticated USING (auth.uid() = profile_id OR is_admin_v4());

CREATE POLICY "permissive_update_profiles" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "permissive_select_profiles" ON public.profiles FOR SELECT USING (true);

-- IV. RELOAD
NOTIFY pgrst, 'reload schema';
