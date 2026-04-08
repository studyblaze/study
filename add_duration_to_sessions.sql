-- Add duration_minutes to sessions table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'duration_minutes') THEN
        ALTER TABLE public.sessions ADD COLUMN duration_minutes INTEGER DEFAULT 50;
    END IF;
END $$;

-- Update RLS for subscriptions (ensure students and tutors can interact correctly)
-- These might already exist from supabase_subscription_model.sql but ensuring they are robust
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own subscriptions" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = student_id OR auth.uid() IN (SELECT profile_id FROM public.tutors WHERE id = tutor_id));

DROP POLICY IF EXISTS "Students can create subscriptions" ON public.subscriptions;
CREATE POLICY "Students can create subscriptions" 
ON public.subscriptions FOR INSERT 
WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can update their own subscriptions" 
ON public.subscriptions FOR UPDATE 
USING (auth.uid() = student_id);
