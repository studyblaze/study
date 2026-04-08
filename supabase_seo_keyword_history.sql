-- Table for tracking keyword rank history
CREATE TABLE IF NOT EXISTS seo_keyword_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword_id UUID REFERENCES seo_keywords(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_keyword_history_keyword_id ON seo_keyword_history(keyword_id);
CREATE INDEX IF NOT EXISTS idx_keyword_history_recorded_at ON seo_keyword_history(recorded_at);

-- RLS Policies
ALTER TABLE seo_keyword_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything on keyword history"
    ON seo_keyword_history FOR ALL
    TO authenticated
    USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );

-- Function to automatically capture keyword state change (optional, or we can do it via API)
-- For now, we'll manually insert via API when ranks are updated.
