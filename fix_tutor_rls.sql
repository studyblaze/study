-- Fix RLS for tutors table to allow signup and updates
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;

-- 1. Allow authenticated users to insert their own tutor application
DROP POLICY IF EXISTS "Users can apply to be tutors" ON tutors;
CREATE POLICY "Users can apply to be tutors" ON tutors
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = profile_id);

-- 2. Allow tutors to update their own profile/application
DROP POLICY IF EXISTS "Tutors can update own profile" ON tutors;
CREATE POLICY "Tutors can update own profile" ON tutors
FOR UPDATE
TO authenticated
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

-- 3. Allow tutors to view their own application (even if not verified)
DROP POLICY IF EXISTS "Tutors can view own profile" ON tutors;
CREATE POLICY "Tutors can view own profile" ON tutors
FOR SELECT
TO authenticated
USING (auth.uid() = profile_id);

-- 4. Admins can do everything
DROP POLICY IF EXISTS "Admins have full access to tutors" ON tutors;
CREATE POLICY "Admins have full access to tutors" ON tutors
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 5. Profiles accessibility (Ensuring users can update their own identity)
DROP POLICY IF EXISTS "Allow individual updates" ON profiles;
CREATE POLICY "Allow individual updates" ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
