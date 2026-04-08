-- SQL Migration: Add referral tracking to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_reward_paid BOOLEAN DEFAULT FALSE;

-- Create an index to speed up lookups by referral code
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);

-- Optional: Populate existing users with a referral code if they don't have one
-- This is a simple version, ideally generate unique human-readable codes.
-- UPDATE public.profiles SET referral_code = encode(digest(email, 'sha256'), 'hex') WHERE referral_code IS NULL;
