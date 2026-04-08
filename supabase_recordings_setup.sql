-- CREATE RECORDINGS TABLE
CREATE TABLE IF NOT EXISTS public.recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    tutor_id INTEGER REFERENCES public.tutors(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    duration TEXT, -- e.g., "50:00"
    size_mb DECIMAL,
    is_processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + interval '90 days') NOT NULL
);

-- ENABLE RLS
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;

-- POLICIES
DROP POLICY IF EXISTS "Students can view their own recordings" ON public.recordings;
CREATE POLICY "Students can view their own recordings" 
ON public.recordings FOR SELECT 
USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Tutors can view their own lesson recordings" ON public.recordings;
CREATE POLICY "Tutors can view their own lesson recordings" 
ON public.recordings FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.tutors 
    WHERE tutors.id = recordings.tutor_id AND tutors.profile_id = auth.uid()
));

-- AUTOMATIC CLEANUP (Optional but good to have)
-- In a real production environment, you'd use a cron job (pg_cron) or a background worker.
-- For now, we rely on the `expires_at` field for UI filtering.

-- REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
