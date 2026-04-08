-- Add promo_code column to bookings table to track coupon usage
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS promo_code TEXT;

-- Update existing records if needed (optional)
-- UPDATE public.bookings SET promo_code = 'TRIAL_DEMO' WHERE is_demo = true AND amount = 25;
