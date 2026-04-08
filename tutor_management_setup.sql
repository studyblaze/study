-- ============================================
-- TUTOR MANAGEMENT SYSTEM SCHEMA UPDATES
-- Run this to enable disabling, pausing, and resuming tutors
-- ============================================

-- 1. Add management columns to tutors table
ALTER TABLE public.tutors 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'disabled')),
ADD COLUMN IF NOT EXISTS restriction_reason TEXT;

-- 2. Force a schema cache reload
NOTIFY pgrst, 'reload schema';

-- 3. Verification Query
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tutors' AND column_name IN ('is_active', 'status', 'restriction_reason');
