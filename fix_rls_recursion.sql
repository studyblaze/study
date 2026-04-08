-- 1. Create a security definer function to check admin role without recursion
CREATE OR REPLACE FUNCTION public.check_user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the recursive policies
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profile visibility" ON public.profiles;

-- 3. Create clean policies
-- Everyone can see (at least) their own profile and public profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- Users can update their own profiles
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can do everything
CREATE POLICY "Admins have full access" 
ON public.profiles FOR ALL 
USING (public.check_user_is_admin());

-- Also fix tutors policy just in case
DROP POLICY IF EXISTS "Admins have full access to tutors" ON public.tutors;
CREATE POLICY "Admins have full access to tutors" 
ON public.tutors FOR ALL 
USING (public.check_user_is_admin());
