-- MASTER COMMUNITY FORUM SCHEMA FIX
-- This script ensures all tables, columns, and relationships for the Community Forum are correctly set up.
-- Run this in the Supabase SQL Editor.

-- 1. Ensure 'posts' table has all required columns
DO $$ 
BEGIN 
    -- Ensure columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='title') THEN
        ALTER TABLE public.posts ADD COLUMN title TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='category') THEN
        ALTER TABLE public.posts ADD COLUMN category TEXT DEFAULT 'General';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='votes_score') THEN
        ALTER TABLE public.posts ADD COLUMN votes_score INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='comments_count') THEN
        ALTER TABLE public.posts ADD COLUMN comments_count INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='is_announcement') THEN
        ALTER TABLE public.posts ADD COLUMN is_announcement BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='forum_type') THEN
        ALTER TABLE public.posts ADD COLUMN forum_type TEXT DEFAULT 'student';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='media_url') THEN
        ALTER TABLE public.posts ADD COLUMN media_url TEXT;
    END IF;
END $$;

-- 2. Ensure Foreign Key Name matches CommunityContext.tsx
-- The code uses: profiles!posts_author_id_fkey
-- We drop any existing author_id FK and recreate it with the explicit name if missing.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'posts_author_id_fkey' AND table_name = 'posts'
    ) THEN
        -- Find existing FK on author_id if any and drop it to avoid conflict
        DECLARE
            existing_fk_name TEXT;
        BEGIN
            SELECT constraint_name INTO existing_fk_name
            FROM information_schema.key_column_usage
            WHERE table_name = 'posts' AND column_name = 'author_id' AND constraint_name != 'posts_pkey'
            LIMIT 1;

            IF existing_fk_name IS NOT NULL THEN
                EXECUTE 'ALTER TABLE public.posts DROP CONSTRAINT ' || quote_ident(existing_fk_name);
            END IF;

            ALTER TABLE public.posts 
            ADD CONSTRAINT posts_author_id_fkey 
            FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
        END;
    END IF;
END $$;

-- 3. Ensure 'post_votes' and 'comments' tables exist
CREATE TABLE IF NOT EXISTS public.post_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vote_type INTEGER NOT NULL CHECK (vote_type IN (1, -1)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Triggers to keep counts in sync (Safety)
CREATE OR REPLACE FUNCTION update_post_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_TABLE_NAME = 'post_votes') THEN
        IF (TG_OP = 'INSERT') THEN
            UPDATE public.posts SET votes_score = COALESCE(votes_score, 0) + NEW.vote_type WHERE id = NEW.post_id;
        ELSIF (TG_OP = 'DELETE') THEN
            UPDATE public.posts SET votes_score = COALESCE(votes_score, 0) - OLD.vote_type WHERE id = OLD.post_id;
        ELSIF (TG_OP = 'UPDATE') THEN
            UPDATE public.posts SET votes_score = COALESCE(votes_score, 0) - OLD.vote_type + NEW.vote_type WHERE id = NEW.post_id;
        END IF;
    ELSIF (TG_TABLE_NAME = 'comments') THEN
        IF (TG_OP = 'INSERT') THEN
            UPDATE public.posts SET comments_count = COALESCE(comments_count, 0) + 1 WHERE id = NEW.post_id;
        ELSIF (TG_OP = 'DELETE') THEN
            UPDATE public.posts SET comments_count = GREATEST(0, COALESCE(comments_count, 0) - 1) WHERE id = OLD.post_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_post_votes_score ON public.post_votes;
CREATE TRIGGER tr_update_post_votes_score AFTER INSERT OR UPDATE OR DELETE ON public.post_votes FOR EACH ROW EXECUTE FUNCTION update_post_metrics();

DROP TRIGGER IF EXISTS tr_update_post_comments_count ON public.comments;
CREATE TRIGGER tr_update_post_comments_count AFTER INSERT OR DELETE ON public.comments FOR EACH ROW EXECUTE FUNCTION update_post_metrics();

-- 5. Final RLS and Refresh
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read posts" ON public.posts;
CREATE POLICY "Anyone can read posts" ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read comments" ON public.comments;
CREATE POLICY "Anyone can read comments" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read votes" ON public.post_votes;
CREATE POLICY "Anyone can read votes" ON public.post_votes FOR SELECT USING (true);

-- Refresh the PostgREST cache
NOTIFY pgrst, 'reload schema';
