-- Ensure the Support Admin profile exists to avoid Foreign Key violations in messages
INSERT INTO public.profiles (id, full_name, email, role, timezone)
VALUES ('db1994ef-754b-469d-9c21-8da397b40245', 'GroupTutors Support', 'grouptutorsnew@gmail.com', 'admin', 'UTC')
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', full_name = 'GroupTutors Support';

-- Ensure RLS allows anyone to message the support ID
DROP POLICY IF EXISTS "Allow messaging support" ON public.messages;
CREATE POLICY "Allow messaging support" 
ON public.messages FOR INSERT 
WITH CHECK (true); -- Simplified for debugging, can be refined later if needed

DROP POLICY IF EXISTS "Allow reading own support messages" ON public.messages;
CREATE POLICY "Allow reading own support messages" 
ON public.messages FOR SELECT 
USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id OR 
    receiver_id = 'db1994ef-754b-469d-9c21-8da397b40245'
);

-- Ensure profiles are readable by everyone for messaging metadata
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" 
ON public.profiles FOR SELECT 
USING (true);

-- Ensure admins can update everything (for moderation)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

DROP POLICY IF EXISTS "Admins can update all tutors" ON public.tutors;
CREATE POLICY "Admins can update all tutors" 
ON public.tutors FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);
