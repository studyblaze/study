-- ============================================
-- STUDY PLANS TABLE
-- Run in Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS public.study_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    exam_date DATE,
    days_left INTEGER DEFAULT 0,
    roadmap JSONB DEFAULT '[]'::jsonb,
    recommendation JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id) -- one active plan per student
);

ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own plans" ON public.study_plans;
CREATE POLICY "Users manage own plans" ON public.study_plans
    FOR ALL USING (auth.uid() = user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_study_plan_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_study_plans_updated ON public.study_plans;
CREATE TRIGGER tr_study_plans_updated
    BEFORE UPDATE ON public.study_plans
    FOR EACH ROW EXECUTE FUNCTION update_study_plan_timestamp();

NOTIFY pgrst, 'reload schema';
