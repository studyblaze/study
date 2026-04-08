-- 1. Update verification_status constraint (Cumulative fix)
ALTER TABLE public.tutors DROP CONSTRAINT IF EXISTS tutors_verification_status_check;
ALTER TABLE public.tutors 
ADD CONSTRAINT tutors_verification_status_check 
CHECK (verification_status IN ('pending', 'verified', 'rejected', 'returned'));

-- 2. Create Admin Activity Table
CREATE TABLE IF NOT EXISTS public.admin_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES public.profiles(id),
    action_type TEXT NOT NULL, -- 'approve_tutor', 'reject_tutor', 'revert_tutor', 'create_job', 'update_job', 'delete_job'
    target_id TEXT, -- ID of the tutor or job
    target_name TEXT, -- Name of the tutor or job title
    details TEXT, -- Additional info like rejection reason
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.admin_activity ENABLE ROW LEVEL SECURITY;

-- 4. Policies
CREATE POLICY "Admins can view all activity" 
ON public.admin_activity FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can insert activity" 
ON public.admin_activity FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 5. Grant Permissions
GRANT ALL ON public.admin_activity TO authenticated;
GRANT ALL ON public.admin_activity TO service_role;
