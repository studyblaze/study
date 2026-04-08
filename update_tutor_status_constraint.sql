-- Drop the existing check constraint on verification_status
ALTER TABLE public.tutors DROP CONSTRAINT IF EXISTS tutors_verification_status_check;

-- Add the updated check constraint including 'returned'
ALTER TABLE public.tutors 
ADD CONSTRAINT tutors_verification_status_check 
CHECK (verification_status IN ('pending', 'verified', 'rejected', 'returned'));

-- Ensure any existing 'pending' tutors that should be 'returned' are handled 
-- (Manual step by admin, but DB is now ready)
