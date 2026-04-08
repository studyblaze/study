-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- POSTS POLICIES
-- 1. Anyone can view posts
DROP POLICY IF EXISTS "Public Read Posts" ON public.posts;
CREATE POLICY "Public Read Posts" ON public.posts FOR SELECT USING (true);

-- 2. Authenticated users can create posts
DROP POLICY IF EXISTS "Authenticated Insert Posts" ON public.posts;
CREATE POLICY "Authenticated Insert Posts" ON public.posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Users can update/delete their own posts
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = author_id);


-- COMMENTS POLICIES
-- 1. Anyone can view comments
DROP POLICY IF EXISTS "Public Read Comments" ON public.comments;
CREATE POLICY "Public Read Comments" ON public.comments FOR SELECT USING (true);

-- 2. Authenticated users can create comments
DROP POLICY IF EXISTS "Authenticated Insert Comments" ON public.comments;
CREATE POLICY "Authenticated Insert Comments" ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Users can update/delete their own comments
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = author_id);


-- POST LIKES POLICIES
-- 1. Anyone can see likes
DROP POLICY IF EXISTS "Public Read Likes" ON public.post_likes;
CREATE POLICY "Public Read Likes" ON public.post_likes FOR SELECT USING (true);

-- 2. Authenticated users can like/unlike
DROP POLICY IF EXISTS "Authenticated Manage Likes" ON public.post_likes;
CREATE POLICY "Authenticated Manage Likes" ON public.post_likes FOR ALL USING (auth.role() = 'authenticated');

-- REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
