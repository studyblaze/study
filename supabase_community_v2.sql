-- ============================================
-- NEXT-LEVEL FORUM SETUP
-- Paste this entire file into Supabase SQL Editor and click Run
-- ============================================

-- 1. POSTS TABLE (Enhanced)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'General', -- General, Math, Science, Help, Motivation
    media_url TEXT,
    likes_count INTEGER DEFAULT 0, -- Legacy support
    votes_score INTEGER DEFAULT 0, -- Reddit-style score
    comments_count INTEGER DEFAULT 0,
    is_announcement BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. POST VOTES (Reddit Style)
CREATE TABLE IF NOT EXISTS public.post_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vote_type INTEGER NOT NULL CHECK (vote_type IN (1, -1)), -- 1 for up, -1 for down
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- 3. COMMENTS (Enhanced)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. SCORE TRIGGER
CREATE OR REPLACE FUNCTION update_post_score()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.posts SET votes_score = votes_score + NEW.vote_type WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.posts SET votes_score = votes_score - OLD.vote_type WHERE id = OLD.post_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE public.posts SET votes_score = votes_score - OLD.vote_type + NEW.vote_type WHERE id = NEW.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_post_votes ON public.post_votes;
CREATE TRIGGER tr_post_votes AFTER INSERT OR DELETE OR UPDATE ON public.post_votes
FOR EACH ROW EXECUTE FUNCTION update_post_score();

-- 5. COMMENT COUNT TRIGGER
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_post_comments ON public.comments;
CREATE TRIGGER tr_post_comments AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- 6. RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;

-- Posts Policies
DROP POLICY IF EXISTS "Anyone can read posts" ON public.posts;
CREATE POLICY "Anyone can read posts" ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
CREATE POLICY "Users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete posts" ON public.posts;
CREATE POLICY "Authors can delete posts" ON public.posts FOR DELETE USING (auth.uid() = author_id);

-- Comments Policies
DROP POLICY IF EXISTS "Anyone can read comments" ON public.comments;
CREATE POLICY "Anyone can read comments" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
CREATE POLICY "Users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Votes Policies
DROP POLICY IF EXISTS "Anyone can read votes" ON public.post_votes;
CREATE POLICY "Anyone can read votes" ON public.post_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can vote" ON public.post_votes;
CREATE POLICY "Users can vote" ON public.post_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can change vote" ON public.post_votes;
CREATE POLICY "Users can change vote" ON public.post_votes FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove vote" ON public.post_votes;
CREATE POLICY "Users can remove vote" ON public.post_votes FOR DELETE USING (auth.uid() = user_id);

-- 7. NOTIFY
NOTIFY pgrst, 'reload schema';
