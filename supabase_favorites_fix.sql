-- Create favorite_tutors table
CREATE TABLE IF NOT EXISTS public.favorite_tutors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tutor_id BIGINT REFERENCES public.tutors(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, tutor_id) -- A user can only favorite a tutor once
);

-- Enable RLS
ALTER TABLE public.favorite_tutors ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can view their own favorites
CREATE POLICY "Users can view their own favorite tutors"
    ON public.favorite_tutors
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own favorites
CREATE POLICY "Users can insert their own favorite tutors"
    ON public.favorite_tutors
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete their own favorite tutors"
    ON public.favorite_tutors
    FOR DELETE
    USING (auth.uid() = user_id);

-- Explicitly allow admins (if needed, though usually admins bypass RLS or have specific role checks)
-- But for this table, we'll keep it simple to the user.
