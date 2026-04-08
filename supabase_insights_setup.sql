-- SUPABASE INSIGHTS SETUP
-- 1. PROFILE VIEWS
CREATE TABLE public.profile_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id INTEGER REFERENCES public.tutors(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TUTOR METRICS (Cached / Calculated)
CREATE TABLE public.tutor_metrics (
  tutor_id INTEGER REFERENCES public.tutors(id) ON DELETE CASCADE PRIMARY KEY,
  average_position DECIMAL DEFAULT 20,
  reply_time_minutes INTEGER DEFAULT 0,
  conversion_ratio DECIMAL DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert for profile views" ON public.profile_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Tutors view their own views" ON public.profile_views FOR SELECT USING (
  auth.uid() IN (SELECT profile_id FROM public.tutors WHERE id = tutor_id)
);

CREATE POLICY "Public Read Tutor Metrics" ON public.tutor_metrics FOR SELECT USING (true);

-- Indexes for performance
CREATE INDEX idx_profile_views_tutor_id ON public.profile_views(tutor_id);
CREATE INDEX idx_profile_views_viewed_at ON public.profile_views(viewed_at);
