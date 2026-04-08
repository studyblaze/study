-- ============================================
-- ADD MISSING LANGUAGES COLUMN TO TUTORS
-- Run this if you see "Could not find the 'languages' column"
-- ============================================

-- 1. Add missing columns with appropriate types
ALTER TABLE public.tutors 
ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- 2. Force a schema cache reload
NOTIFY pgrst, 'reload schema';

-- 3. Verification Query (Run this to confirm)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tutors' AND column_name IN ('languages', 'badges', 'is_active', 'is_verified', 'is_visible');
