-- 1. UPDATE PROFILE ROLE CONSTRAINT
-- Note: This is a manual instruction to run if the DB doesn't support easy ALTER. 
-- For now, we assume the application layer handles the roles properly, 
-- but we should ideally update the CHECK constraint.
-- ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
-- ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'tutor', 'admin', 'moderator'));

-- 2. CREATE TRAINING MODULES TABLE
CREATE TABLE IF NOT EXISTS public.training_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    duration TEXT NOT NULL,
    video_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CREATE TUTOR TRAINING PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.tutor_training_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id INTEGER REFERENCES public.tutors(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.training_modules(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('in-progress', 'completed')) DEFAULT 'in-progress',
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(tutor_id, module_id)
);

-- 4. ENABLE RLS
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_training_progress ENABLE ROW LEVEL SECURITY;

-- 5. POLICIES
CREATE POLICY "Anyone can view training modules" ON public.training_modules FOR SELECT USING (true);
CREATE POLICY "Tutors can view their own progress" ON public.tutor_training_progress FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tutors WHERE tutors.id = tutor_training_progress.tutor_id AND tutors.profile_id = auth.uid())
);
CREATE POLICY "Tutors can update their own progress" ON public.tutor_training_progress FOR ALL USING (
    EXISTS (SELECT 1 FROM public.tutors WHERE tutors.id = tutor_training_progress.tutor_id AND tutors.profile_id = auth.uid())
);

-- 6. SEED DATA
INSERT INTO public.training_modules (title, category, duration, order_index) VALUES
('Platform Onboarding', 'Basics', '15m', 1),
('Group Pedagogy: Engagement', 'Teaching', '45m', 2),
('Using the Interactive Whiteboard', 'Tools', '20m', 3),
('Handling Difficult Students', 'Psychology', '30m', 4),
('Advanced LaTeX for Maths', 'Subject Matter', '40m', 5);

NOTIFY pgrst, 'reload schema';
