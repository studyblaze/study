-- Elite Ecosystem Expansion Schema

-- 1. Parent Profiles
CREATE TABLE IF NOT EXISTS parent_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Parent-Student Linking
CREATE TABLE IF NOT EXISTS parent_student_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES parent_profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    relationship TEXT, -- 'father', 'mother', 'guardian', etc.
    status TEXT DEFAULT 'pending', -- 'pending', 'active', 'revoked'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(parent_id, student_id)
);

-- 3. Growth Reports (AI-generated)
CREATE TABLE IF NOT EXISTS growth_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    report_title TEXT NOT NULL,
    summary TEXT NOT NULL, -- The AI-generated summary
    strengths TEXT[],
    areas_of_improvement TEXT[],
    metrics JSONB, -- { "attendance": 95, "engagement": 88, "xp_earned": 1200 }
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Safety & Session Recordings
CREATE TABLE IF NOT EXISTS session_recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    recording_url TEXT NOT NULL,
    duration_seconds INTEGER,
    is_reviewed_by_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS Policies
ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_recordings ENABLE ROW LEVEL SECURITY;

-- Parents can view their own profile
CREATE POLICY "Parents can view own profile" ON parent_profiles
    FOR SELECT USING (auth.uid() = profile_id);

-- Parents can view their links
CREATE POLICY "Parents can view student links" ON parent_student_links
    FOR SELECT USING (auth.uid() IN (
        SELECT profile_id FROM parent_profiles WHERE id = parent_id
    ));

-- Parents can view reports for their linked students
CREATE POLICY "Parents can view linked student reports" ON growth_reports
    FOR SELECT USING (auth.uid() IN (
        SELECT p.profile_id FROM parent_profiles p
        JOIN parent_student_links l ON l.parent_id = p.id
        WHERE l.student_id = growth_reports.student_id AND l.status = 'active'
    ));

-- Indexes for performance
CREATE INDEX idx_parent_student_links_student ON parent_student_links(student_id);
CREATE INDEX idx_growth_reports_student ON growth_reports(student_id);
CREATE INDEX idx_session_recordings_session ON session_recordings(session_id);
