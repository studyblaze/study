-- PROMOTE USER TO ADMIN
-- Run this in Supabase SQL Editor to grant admin access to grouptutorsnew@gmail.com

UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'grouptutorsnew@gmail.com';

-- Verify the change
SELECT id, email, role FROM public.profiles WHERE email = 'grouptutorsnew@gmail.com';

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
