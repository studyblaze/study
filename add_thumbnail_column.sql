-- Add missing video_thumbnail_url column to tutors table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.tutors 
ADD COLUMN IF NOT EXISTS video_thumbnail_url TEXT;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
