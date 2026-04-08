-- Migration to add approval support to recordings
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;

-- Update existing recordings to be approved (optional, but good for past content)
UPDATE recordings SET is_approved = TRUE WHERE is_approved IS NULL;

-- Add a comment for clarification
COMMENT ON COLUMN recordings.is_approved IS 'Whether the recording is approved for student viewing.';
