-- Add account deletion tracking columns to the profiles table
-- These columns are required for both Student and Tutor account deactivation logic.

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Optional: Index for better filtering if needed in admin panels
CREATE INDEX IF NOT EXISTS idx_profiles_is_deleted ON profiles(is_deleted);
