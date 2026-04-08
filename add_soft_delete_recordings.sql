-- Migration to add soft delete support to recordings
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add a comment for clarification
COMMENT ON COLUMN recordings.deleted_at IS 'Timestamp when the recording was soft-deleted. Null if active.';
