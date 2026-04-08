-- Create job_posts table
CREATE TABLE IF NOT EXISTS job_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    company TEXT,
    location TEXT,
    type TEXT, -- 'full-time', 'part-time', 'freelance'
    salary_range TEXT,
    posted_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active', -- 'active', 'closed'
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Job posts are publicly readable" 
ON job_posts FOR SELECT 
TO public 
USING (status = 'active');

CREATE POLICY "Admins have full access to job posts" 
ON job_posts FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'admin' OR profiles.role = 'founder')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'admin' OR profiles.role = 'founder')
    )
);

-- Grant permissions
GRANT ALL ON job_posts TO authenticated;
GRANT SELECT ON job_posts TO anon;
