-- PROMOTE NEW EMAILS TO ADMIN ROLE
-- Run this in the Supabase SQL Editor

UPDATE public.profiles 
SET role = 'admin' 
WHERE email IN ('aeraxiagroup@gmail.com', 'dban1157@gmail.com');

-- Verify the change
SELECT id, email, role FROM public.profiles WHERE role = 'admin';
