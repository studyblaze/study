-- Migration: Introduce 3-Tier Tutor Hierarchy System
-- This script adds the strict 'tier' classification column to the tutors table.

-- 1. Create the new column with constraints
ALTER TABLE public.tutors
ADD COLUMN IF NOT EXISTS tier text DEFAULT 'normal' CHECK (tier IN ('normal', 'professional', 'elite'));

-- 2. Retroactively migrate tutors who are already considered elite by existing logic 
-- (Assuming there is a boolean column or similar. If not, this is a no-op that ensures safety.)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tutors' AND column_name='is_elite_tutor') THEN
        EXECUTE 'UPDATE public.tutors SET tier = ''elite'' WHERE is_elite_tutor = true';
    END IF;
END $$;
