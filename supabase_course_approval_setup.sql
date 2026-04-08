-- Migration to add admin_approved column to courses
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS admin_approved BOOLEAN DEFAULT false;

-- Update RLS policies (optional, but good practice if needed)
-- We will handle visibility logic via application code (eq('admin_approved', true)) 
-- so RLS changes aren't strictly mandatory if the app enforces it, but setting it provides defense-in-depth.

-- By default, allow admins to update this field
CREATE POLICY "Admins can update any course approval" ON public.courses
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
