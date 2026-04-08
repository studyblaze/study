-- Multi-Exam Upgrade for m4 Passion Project

-- 1. Modify Revisions table to include subject
ALTER TABLE IF EXISTS spaced_repetition_revisions 
ADD COLUMN IF NOT EXISTS subject TEXT DEFAULT 'M4';

-- 2. Modify Missions table to use JSONB subject_data
-- We store: { subject: { completed, target, total, position, color } }
ALTER TABLE IF EXISTS user_daily_missions 
ADD COLUMN IF NOT EXISTS subject_data JSONB DEFAULT '{
  "M4": { "completed": 0, "target": 4, "total": 120, "position": 1, "color": "#a855f7", "d_day": "2026-05-12" },
  "WEBX": { "completed": 0, "target": 1, "total": 30, "position": 1, "color": "#3b82f6", "d_day": "2026-05-17" },
  "TCS": { "completed": 0, "target": 2, "total": 60, "position": 1, "color": "#10b981", "d_day": "2026-06-02" },
  "M3": { "completed": 0, "target": 3, "total": 120, "position": 1, "color": "#f59e0b", "d_day": "2026-06-04" }
}';

-- Indexing
CREATE INDEX IF NOT EXISTS idx_rev_subject ON spaced_repetition_revisions(subject);
