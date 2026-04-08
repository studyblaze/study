-- SUPPORT CHAT RLS FIXES
-- Ensure RLS is enabled on messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow users to see messages they are involved in
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
CREATE POLICY "Users can view their own messages" ON messages
FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

-- Allow users to send messages
DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages
FOR INSERT WITH CHECK (
  auth.uid() = sender_id
);

-- TUTOR TABLE RLS FIXES
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;

-- Everyone can view verified tutors
DROP POLICY IF EXISTS "Public can view verified tutors" ON tutors;
CREATE POLICY "Public can view verified tutors" ON tutors
FOR SELECT USING (
  verification_status = 'verified' OR auth.uid() = profile_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- STORAGE BUCKETS SETUP (Public policies for simplicity in viewing docs/videos)
-- Note: In a production environment, you might want more restrictive policies.

-- Create buckets if they don't exist (These must be created in the Supabase UI Storage section)
-- chat-attachments
-- tutor-docs
-- intro-videos

-- Suggested Storage Policies (Run these after creating buckets in UI):

-- tutor-docs storage policies
-- CREATE POLICY "All authenticated users can upload tutor docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'tutor-docs' AND auth.role() = 'authenticated');
-- CREATE POLICY "Public viewing for tutor docs" ON storage.objects FOR SELECT USING (bucket_id = 'tutor-docs');

-- intro-videos storage policies
-- CREATE POLICY "All authenticated users can upload intro videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'intro-videos' AND auth.role() = 'authenticated');
-- CREATE POLICY "Public viewing for intro videos" ON storage.objects FOR SELECT USING (bucket_id = 'intro-videos');
