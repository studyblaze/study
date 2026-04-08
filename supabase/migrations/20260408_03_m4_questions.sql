-- Question Repository for m4 Exam Commander

CREATE TABLE IF NOT EXISTS subject_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    answer_text TEXT NOT NULL,
    hint_text TEXT,
    difficulty TEXT DEFAULT 'normal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(subject, question_number)
);

-- Index for fast lookup by subject and number
CREATE INDEX IF NOT EXISTS idx_sq_subject_num ON subject_questions(subject, question_number);
