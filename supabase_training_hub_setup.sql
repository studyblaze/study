-- Ensure we have the necessary columns for the dynamic training hub setup
ALTER TABLE public.training_modules ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.training_modules ADD COLUMN IF NOT EXISTS article_content TEXT;

-- We can also ensure an order_index exists if it doesn't already
ALTER TABLE public.training_modules ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Optional: ensure RLS allows admins to edit
-- assuming public.training_modules already exists
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view training modules" ON public.training_modules;
CREATE POLICY "Anyone can view training modules" ON public.training_modules
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage training modules" ON public.training_modules;
CREATE POLICY "Admins can manage training modules" ON public.training_modules
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
