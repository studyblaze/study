-- ============================================
-- NUCLEAR TUTOR RLS REMEDIATION
-- This script WIPES ALL policies first to ensure no hidden restrictions.
-- ============================================

-- 1. Wipe all existing policies on tutors and profiles to avoid conflicts
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
CREATE OR REPLACE FUNCTION public.is_admin_v3()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create the SECURE Profile ID Trigger
CREATE OR REPLACE FUNCTION public.force_profile_id_v3()
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
  FOR EACH ROW EXECUTE FUNCTION public.force_profile_id_v3();

-- 5. RE-APPLY CLEAN POLICIES

-- TUTORS: Anyone logged in can insert their own application
CREATE POLICY "permissive_insert_tutors" ON public.tutors
FOR INSERT TO authenticated
WITH CHECK (true);

-- TUTORS: Users can view and update their own records
CREATE POLICY "permissive_select_tutors" ON public.tutors
FOR SELECT TO authenticated
USING (auth.uid() = profile_id OR verification_status = 'verified' OR is_admin_v3());

CREATE POLICY "permissive_update_tutors" ON public.tutors
FOR UPDATE TO authenticated
USING (auth.uid() = profile_id OR is_admin_v3());

-- PROFILES: Users can update their own role (needed for student -> tutor)
CREATE POLICY "permissive_update_profiles" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- PROFILES: Everyone can see profiles
CREATE POLICY "permissive_select_profiles" ON public.profiles
FOR SELECT USING (true);

-- ADMIN: Full override for tutors
CREATE POLICY "admin_all_tutors" ON public.tutors
FOR ALL TO authenticated
USING (is_admin_v3());

-- 6. Reload Schema
NOTIFY pgrst, 'reload schema';
