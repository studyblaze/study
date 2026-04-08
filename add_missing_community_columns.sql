-- ============================================
-- SQL FIX: MISSING COMMUNITY COLUMNS
-- ============================================
-- Run this in your Supabase SQL Editor (https://app.supabase.com)
-- This adds the 'title' and 'is_announcement' columns if they are missing.

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_announcement BOOLEAN DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';

-- Refresh the PostgREST cache (Supabase API)
NOTIFY pgrst, 'reload schema';
