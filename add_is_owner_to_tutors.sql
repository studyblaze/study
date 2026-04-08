-- add_is_owner_to_tutors.sql
-- Adds the missing is_owner column to the tutors table to support commission logic

-- 1. Add the column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tutors' AND column_name = 'is_owner') THEN
        ALTER TABLE public.tutors ADD COLUMN is_owner BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 2. Mark Shreyash Kale as the owner
-- Shreyash Kale Profile ID: 54fb63ef-cc85-4c65-8d02-0787497a381d
UPDATE public.tutors 
SET is_owner = TRUE 
WHERE profile_id = '54fb63ef-cc85-4c65-8d02-0787497a381d';

-- 3. REFRESH schema
NOTIFY pgrst, 'reload schema';
