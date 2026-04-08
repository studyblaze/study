-- Create the chat-attachments bucket if it doesn't exist
-- Note: If this fails with "permission denied", please create the bucket 'chat-attachments' manually in the Supabase Dashboard.
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist to avoid "already exists" errors
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Users Update Own Objects" ON storage.objects;
DROP POLICY IF EXISTS "Users Delete Own Objects" ON storage.objects;

-- Allow public access to read from the chat-attachments bucket
CREATE POLICY "Public Read Access for Chat"
ON storage.objects FOR SELECT
USING ( bucket_id = 'chat-attachments' );

-- Allow authenticated users to upload to the chat-attachments bucket
CREATE POLICY "Authenticated Upload Access for Chat"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'chat-attachments' );

-- Allow users to update their own objects in the chat-attachments bucket
CREATE POLICY "Users Update Own Objects for Chat"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'chat-attachments' AND auth.uid() = owner );

-- Allow users to delete their own objects in the chat-attachments bucket
CREATE POLICY "Users Delete Own Objects for Chat"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'chat-attachments' AND auth.uid() = owner );
