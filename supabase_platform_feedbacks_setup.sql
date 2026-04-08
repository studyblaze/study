-- Platform Feedbacks Table Setup
CREATE TABLE IF NOT EXISTS public.platform_feedbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('bug', 'feature_request', 'general')),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.platform_feedbacks ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can insert their own feedback
CREATE POLICY "Users can insert their own feedback"
    ON public.platform_feedbacks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all feedback
CREATE POLICY "Admins can view all feedback"
    ON public.platform_feedbacks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
