-- 1. Ensure RLS is active
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow authors to delete comments" ON comments;
DROP POLICY IF EXISTS "Allow admins to delete comments" ON comments;

-- 3. Create the policy allowing authors to delete their own comments
CREATE POLICY "Allow authors to delete comments" 
ON comments 
FOR DELETE 
USING (auth.uid() = author_id);

-- 4. Create the policy allowing admins to delete ANY comments
CREATE POLICY "Allow admins to delete comments" 
ON comments 
FOR DELETE 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR email IN ('grouptutorsnew@gmail.com', 'aeraxiagroup@gmail.com'))));
