-- Setup deleted_tutors table for backups and reason tracking
CREATE TABLE IF NOT EXISTS deleted_tutors (
    id SERIAL PRIMARY KEY,
    original_tutor_id INTEGER,
    profile_id UUID,
    full_name TEXT,
    email TEXT,
    subject TEXT,
    bio TEXT,
    hourly_rate NUMERIC,
    application_data JSONB,
    verification_status TEXT,
    deletion_reason TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_by TEXT DEFAULT 'admin'
);

-- Ensure RLS is enabled but accessible to service role/admin
ALTER TABLE deleted_tutors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything on deleted_tutors" 
ON deleted_tutors FOR ALL 
USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
