-- Add missing price columns to tutors table
-- Run this in your Supabase SQL Editor

ALTER TABLE tutors 
ADD COLUMN IF NOT EXISTS price_5 DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS price_10 DECIMAL(10,2);

-- Also add helpful comments
COMMENT ON COLUMN tutors.price_5 IS 'Hourly rate for a group of 5 students';
COMMENT ON COLUMN tutors.price_10 IS 'Hourly rate for a group of 10 students';
