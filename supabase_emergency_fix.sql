-- ADD MISSING COLUMN TO TUTORS TABLE
ALTER TABLE public.tutors 
ADD COLUMN IF NOT EXISTS intro_video_url TEXT;

-- ADD MISSING COLUMNS TO PROFILES TABLE
-- This fixes the messaging section failure
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS country TEXT;

-- Update existing profiles with a default timezone
UPDATE public.profiles SET timezone = 'UTC' WHERE timezone IS NULL;

-- Force Supabase to refresh its internal schema cache immediately
NOTIFY pgrst, 'reload schema';

-- COMMAND TO DELETE ALL MESSAGES (START FRESH)
-- DELETE FROM public.messages;

-- COMMANDS TO SETUP STORAGE FOR PROFILE PICTURES
-- Create the avatars bucket if it doesn't exist
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- STORAGE POLICIES (Run in SQL Editor)
-- 1. Allow public to READ avatars
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- 2. Allow authenticated users to UPLOAD avatars
-- CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- 3. Allow users to DELETE their own avatars
-- CREATE POLICY "User Delete Own Avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- MESSAGING FIX: Allow recipients to mark messages as read
-- Run this in SQL Editor to fix unread count persistence
/*
CREATE POLICY "Recipients can update is_read" ON public.messages 
FOR UPDATE 
USING (
  auth.uid() = receiver_id OR 
  (receiver_id = '00000000-0000-0000-0000-000000000001' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
)
WITH CHECK (
  auth.uid() = receiver_id OR 
  (receiver_id = '00000000-0000-0000-0000-000000000001' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
);
*/
