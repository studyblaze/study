-- Run this in your Supabase SQL Editor to add the missing document columns to the tutors table.
-- This fix addresses the "Could not find column" error during tutor application submission.

DO $$ 
BEGIN 
    -- Add 'cv_url' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tutors' AND column_name='cv_url') THEN
        ALTER TABLE public.tutors ADD COLUMN cv_url TEXT;
    END IF;

    -- Add 'certifications_url' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tutors' AND column_name='certifications_url') THEN
        ALTER TABLE public.tutors ADD COLUMN certifications_url TEXT;
    END IF;

    -- Ensure 'identity_docs_url' exists (should already be there, but for safety)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tutors' AND column_name='identity_docs_url') THEN
        ALTER TABLE public.tutors ADD COLUMN identity_docs_url TEXT;
    END IF;

    -- Add 'is_visible' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tutors' AND column_name='is_visible') THEN
        ALTER TABLE public.tutors ADD COLUMN is_visible BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add 'is_active' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tutors' AND column_name='is_active') THEN
        ALTER TABLE public.tutors ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;

    -- Add 'status' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tutors' AND column_name='status') THEN
        ALTER TABLE public.tutors ADD COLUMN status TEXT DEFAULT 'active';
    END IF;

    -- Update verification_status check constraint to include 'returned' and 'incomplete'
    -- First, try to find and drop any existing check constraint on verification_status
    DECLARE
        con_name TEXT;
    BEGIN
        SELECT conname INTO con_name
        FROM pg_constraint
        WHERE conrelid = 'public.tutors'::regclass
        AND confkey IS NULL
        AND array_to_string(conkey, ',') = (
            SELECT attnum::text
            FROM pg_attribute
            WHERE attrelid = 'public.tutors'::regclass
            AND attname = 'verification_status'
        );

        IF con_name IS NOT NULL THEN
            EXECUTE 'ALTER TABLE public.tutors DROP CONSTRAINT ' || con_name;
        END IF;
    END;

    -- Add the new constraint with 'returned' and 'incomplete'
    ALTER TABLE public.tutors ADD CONSTRAINT tutors_verification_status_check 
    CHECK (verification_status IN ('pending', 'verified', 'rejected', 'returned', 'incomplete'));

END $$;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
