-- Allow admins to manage all profiles
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Ensure authenticated users can still see relevant profile info
DROP POLICY IF EXISTS "Public profile visibility" ON public.profiles;
CREATE POLICY "Public profile visibility" 
ON public.profiles 
FOR SELECT 
USING (true);
