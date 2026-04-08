-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    founder_name TEXT DEFAULT 'Founder',
    profile_pic_url TEXT DEFAULT '/admin_profile.png',
    logo_url TEXT DEFAULT '/logo.png',
    founders JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT one_row_only CHECK (id = 1)
);

-- Ensure logo_url column exists (for existing tables)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='site_settings' AND column_name='logo_url') THEN
        ALTER TABLE public.site_settings ADD COLUMN logo_url TEXT DEFAULT '/logo.png';
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Settings' AND tablename = 'site_settings') THEN
        CREATE POLICY "Public Read Settings" ON public.site_settings FOR SELECT USING (true);
    END IF;
END $$;

-- Allow admin updates
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin Update Settings' AND tablename = 'site_settings') THEN
        CREATE POLICY "Admin Update Settings" ON public.site_settings 
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'admin'
            )
        );
    END IF;
END $$;

-- Seed initial data
INSERT INTO public.site_settings (id, founder_name, profile_pic_url, logo_url)
VALUES (1, 'Founder', '/admin_profile.png', '/logo.png')
ON CONFLICT (id) DO UPDATE SET
    logo_url = EXCLUDED.logo_url
    WHERE site_settings.logo_url IS NULL;
