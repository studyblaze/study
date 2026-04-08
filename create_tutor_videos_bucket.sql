-- Create a storage bucket for tutor intro videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tutor-videos', 'tutor-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for the tutor-videos bucket
-- Allow public to read videos
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'tutor-videos');

-- Allow authenticated users (tutors) to upload their own videos
CREATE POLICY "Tutor Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'tutor-videos' 
    AND (auth.role() = 'authenticated')
);

-- Allow tutors to update/delete their own videos
CREATE POLICY "Tutor Management Access" 
ON storage.objects FOR ALL 
USING (
    bucket_id = 'tutor-videos' 
    AND (auth.uid()::text = (storage.foldername(name))[1])
);
