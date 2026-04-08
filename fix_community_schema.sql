-- Run this in your Supabase SQL Editor to fix the Community Feed
-- This script safely adds missing columns if they don't exist

DO $$ 
BEGIN 
    -- Add 'title' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='title') THEN
        ALTER TABLE public.posts ADD COLUMN title TEXT;
    END IF;

    -- Add 'category' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='category') THEN
        ALTER TABLE public.posts ADD COLUMN category TEXT DEFAULT 'General';
    END IF;

    -- Add 'votes_score' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='votes_score') THEN
        ALTER TABLE public.posts ADD COLUMN votes_score INTEGER DEFAULT 0;
    END IF;

    -- Add 'likes_count' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='likes_count') THEN
        ALTER TABLE public.posts ADD COLUMN likes_count INTEGER DEFAULT 0;
    END IF;

    -- Add 'comments_count' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='comments_count') THEN
        ALTER TABLE public.posts ADD COLUMN comments_count INTEGER DEFAULT 0;
    END IF;

    -- Add 'is_announcement' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='is_announcement') THEN
        ALTER TABLE public.posts ADD COLUMN is_announcement BOOLEAN DEFAULT false;
    END IF;

    -- Add 'media_url' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='media_url') THEN
        ALTER TABLE public.posts ADD COLUMN media_url TEXT;
    END IF;
END $$;

-- Ensure RLS is enabled and policies exist
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "posts_select" ON public.posts;
CREATE POLICY "posts_select" ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "posts_insert" ON public.posts;
CREATE POLICY "posts_insert" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Refresh schema
NOTIFY pgrst, 'reload schema';
