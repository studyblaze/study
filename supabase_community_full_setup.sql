-- Run this in Supabase SQL Editor to set up the Community Forum
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    votes_score INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_announcement BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Create Post Votes Table
CREATE TABLE IF NOT EXISTS public.post_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vote_type INTEGER NOT NULL, -- 1 for upvote, -1 for downvote
    UNIQUE(post_id, user_id)
);

-- 3. Create Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 5. Policies for Posts
DROP POLICY IF EXISTS "posts_select" ON public.posts;
CREATE POLICY "posts_select" ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "posts_insert" ON public.posts;
CREATE POLICY "posts_insert" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "posts_update" ON public.posts;
CREATE POLICY "posts_update" ON public.posts FOR UPDATE WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "posts_delete" ON public.posts;
CREATE POLICY "posts_delete" ON public.posts FOR DELETE USING (auth.uid() = author_id);

-- 6. Policies for Votes
DROP POLICY IF EXISTS "votes_select" ON public.post_votes;
CREATE POLICY "votes_select" ON public.post_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "votes_insert" ON public.post_votes;
CREATE POLICY "votes_insert" ON public.post_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "votes_update" ON public.post_votes;
CREATE POLICY "votes_update" ON public.post_votes FOR UPDATE WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "votes_delete" ON public.post_votes;
CREATE POLICY "votes_delete" ON public.post_votes FOR DELETE USING (auth.uid() = user_id);

-- 7. Policies for Comments
DROP POLICY IF EXISTS "comments_select" ON public.comments;
CREATE POLICY "comments_select" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "comments_insert" ON public.comments;
CREATE POLICY "comments_insert" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "comments_update" ON public.comments;
CREATE POLICY "comments_update" ON public.comments FOR UPDATE WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "comments_delete" ON public.comments;
CREATE POLICY "comments_delete" ON public.comments FOR DELETE USING (auth.uid() = author_id);

-- 8. Refresh Schema
NOTIFY pgrst, 'reload schema';
