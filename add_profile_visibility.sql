-- Add is_visible column to tutors table
ALTER TABLE public.tutors 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE;

-- Update RLS if needed (already public read, but specifically for visibility later)
-- We don't need a separate policy yet as "Public Read Tutors" is true, 
-- but we will use this column in search queries.
