-- Add exam_type to sessions table
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS exam_type TEXT;

-- Index for faster batch lookup
CREATE INDEX IF NOT EXISTS idx_sessions_date_tutor_exam ON public.sessions(date, tutor_id, exam_type);
