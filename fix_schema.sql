-- Fix for missing columns in bookings table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS amount_inr DECIMAL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;

-- Ensure tutors table has localized pricing columns
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS price_5 DECIMAL;
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS price_10 DECIMAL;
ALTER TABLE public.tutors ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';

-- Fix for currency context in transactions
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS amount_inr DECIMAL;
