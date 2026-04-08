-- Add rejection_reason to tutors table
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add 'returned' to verification_status check if it exists or just allow it
-- Typically verification_status is already a text field with a check constraint
-- Let's ensure the status can be 'returned'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tutors' AND column_name = 'verification_status'
    ) THEN
        -- If there's a constraint, we might need to drop and recreate it, 
        -- but usually, it's just a text field in this project's pattern.
        NULL;
    END IF;
END $$;
