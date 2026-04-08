-- ============================================
-- ROBUST TUTOR APPLICATION RLS & SCHEMA FIX
-- ============================================

-- 1. Fix 'verification_status' check constraint to include 'returned'
-- We have to drop the old one and add the new one
DO $$ 
BEGIN
    ALTER TABLE public.tutors DROP CONSTRAINT IF EXISTS tutors_verification_status_check;
    ALTER TABLE public.tutors ADD CONSTRAINT tutors_verification_status_check 
        CHECK (verification_status IN ('pending', 'verified', 'rejected', 'returned'));
EXCEPTION
    WHEN undefined_object THEN
        -- If it wasn't there, just add it
        ALTER TABLE public.tutors ADD CONSTRAINT tutors_verification_status_check 
            CHECK (verification_status IN ('pending', 'verified', 'rejected', 'returned'));
END $$;

-- 2. Create a SECURITY DEFINER trigger to handle profile_id automatically
-- This ensures that even if the frontend sends the wrong (or no) profile_id, 
-- the database correctly assigns it to the authenticated user.
CREATE OR REPLACE FUNCTION public.handle_tutor_submit()
RETURNS TRIGGER AS $$
BEGIN
  -- Always set profile_id to the actual authenticated user's UID
  -- unless they are an admin (admins can skip this if we want them to insert for others)
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    NEW.profile_id := auth.uid();
  END IF;
  
  -- Ensure verification_status is 'pending' for new applications (unless admin)
  IF TG_OP = 'INSERT' AND NEW.verification_status IS NULL THEN
    NEW.verification_status := 'pending';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_tutor_submit ON public.tutors;
CREATE TRIGGER on_tutor_submit
  BEFORE INSERT OR UPDATE ON public.tutors
  FOR EACH ROW EXECUTE FUNCTION public.handle_tutor_submit();

-- 3. Robust RLS Policies

-- Enable RLS
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- TUTORS policies
DROP POLICY IF EXISTS "Allow user insert own application" ON public.tutors;
CREATE POLICY "Allow user insert own application" ON public.tutors
FOR INSERT WITH CHECK (
  auth.uid() = profile_id OR auth.uid() IS NOT NULL
);

DROP POLICY IF EXISTS "Allow user update own application" ON public.tutors;
CREATE POLICY "Allow user update own application" ON public.tutors
FOR UPDATE USING (
  auth.uid() = profile_id
);

DROP POLICY IF EXISTS "Allow user view own application" ON public.tutors;
CREATE POLICY "Allow user view own application" ON public.tutors
FOR SELECT USING (
  auth.uid() = profile_id OR verification_status = 'verified'
);

-- Admin Bypass (FOR ALL)
DROP POLICY IF EXISTS "Admin full access" ON public.tutors;
CREATE POLICY "Admin full access" ON public.tutors
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 4. Final Reload
NOTIFY pgrst, 'reload schema';
