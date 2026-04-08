-- ========================================================
-- THE TRULY ULTIMATE SUPABASE FIX V5
-- Fixes "New row violates row-level security policy"
-- specifically for Storage (FileUpload) and Tutor Apps.
-- ========================================================

-- 1. BUCKET RE-VERIFICATION
-- Ensure all buckets exist AND are public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
    ('avatars', 'avatars', true, 5242880, '{"image/*"}'), 
    ('tutor-docs', 'tutor-docs', true, 10485760, '{"image/*","application/pdf"}'), 
    ('intro-videos', 'intro-videos', true, 52428800, '{"video/*","image/*"}')
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. STORAGE RLS (Nuclear Reset)
-- This removes any conflicting legacy policies from previous fixes
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END LOOP;
END $$;

-- A. PUBLIC/AUTHENTICATED SELECT (Read Access)
-- This ensures avatars and vids are visible to students and fellow tutors
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
USING (bucket_id IN ('avatars', 'tutor-docs', 'intro-videos'));

-- B. AUTHENTICATED INSERT (The Fix for Tutor Onboarding)
-- We allow any logged-in user to UPLOAD if the bucket matches.
-- This is critical for new tutors whose profiles aren't fully set up yet.
CREATE POLICY "Authenticated Upload Access" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id IN ('avatars', 'tutor-docs', 'intro-videos'));

-- C. OWNER MANAGEMENT (Update/Delete/All)
-- We use LIKE pattern matching to check if the user's ID is in the file path.
-- This is more robust than folder-level checks which fail with nested paths.
CREATE POLICY "Owner Management Access" 
ON storage.objects FOR ALL 
TO authenticated 
USING (
    bucket_id IN ('avatars', 'tutor-docs', 'intro-videos') 
    AND (
        (name LIKE '%' || auth.uid()::text || '%') 
        OR (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    )
)
WITH CHECK (
    bucket_id IN ('avatars', 'tutor-docs', 'intro-videos') 
    AND (
        (name LIKE '%' || auth.uid()::text || '%') 
        OR (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    )
);


-- 3. TUTORS TABLE RE-VERIFICATION
-- Ensure the tutors table itself doesn't block the INSERT after files upload.
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow Auth Insert Tutors" ON public.tutors;
CREATE POLICY "Allow Auth Insert Tutors" 
ON public.tutors FOR INSERT 
TO authenticated 
WITH CHECK (true); -- We allow any logged in user to create a tutor application row

DROP POLICY IF EXISTS "Allow Update Tutors" ON public.tutors;
CREATE POLICY "Allow Update Tutors" 
ON public.tutors FOR UPDATE 
TO authenticated 
USING (
    auth.uid() = profile_id 
    OR (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
);

-- 4. RELOAD SCHEMA
NOTIFY pgrst, 'reload schema';
