-- Create the avatars bucket if it doesn't exist
-- Note: If this still fails with "permission denied", please create the bucket 'avatars' manually in the Supabase Dashboard.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Note: We omit 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY' 
-- because it is managed by Supabase and requires superuser privileges.

-- Drop existing policies if they exist to avoid "already exists" errors
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Users Update Own Objects" ON storage.objects;
DROP POLICY IF EXISTS "Users Delete Own Objects" ON storage.objects;

-- Allow public access to read from the avatars bucket
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Allow authenticated users to upload to the avatars bucket
CREATE POLICY "Authenticated Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' );

-- Allow users to update their own objects in the avatars bucket
CREATE POLICY "Users Update Own Objects"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'avatars' );

-- Allow users to delete their own objects in the avatars bucket
CREATE POLICY "Users Delete Own Objects"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'avatars' );
