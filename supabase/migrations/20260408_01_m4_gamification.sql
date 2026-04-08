-- Revision and Board Tables for m4 Passion Project

-- 1. Spaced Repetition Revisions
CREATE TABLE IF NOT EXISTS spaced_repetition_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    topic_name TEXT NOT NULL,
    interval_stage INTEGER DEFAULT 0, -- 0, 1, 2, 3 (Days: 1, 3, 7, 30)
    next_revision_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Daily Missions & Board Progress
CREATE TABLE IF NOT EXISTS user_daily_missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    board_position INTEGER DEFAULT 1, -- Grid 1-120
    new_completed INTEGER DEFAULT 0,
    new_target INTEGER DEFAULT 3,
    revision_completed INTEGER DEFAULT 0,
    revision_target INTEGER DEFAULT 2,
    daily_streak INTEGER DEFAULT 1,
    is_boss_battle BOOLEAN DEFAULT FALSE,
    last_active_date DATE DEFAULT CURRENT_DATE,
    total_xp INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_rev_user_next ON spaced_repetition_revisions(user_id, next_revision_at);
CREATE INDEX IF NOT EXISTS idx_mission_user ON user_daily_missions(user_id);
