-- ==========================================
-- PRIVACY & CURRENCY SUPPORT MIGRATION
-- ==========================================

-- 1. Add currency columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS currency_symbol TEXT DEFAULT '₹';

-- 2. Update existing profiles with defaults if they were NULL
UPDATE public.profiles 
SET currency = 'INR', currency_symbol = '₹'
WHERE currency IS NULL;
