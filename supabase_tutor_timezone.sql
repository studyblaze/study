-- Add timezone and country columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS country TEXT;

-- Update existing profiles with a default timezone if needed
UPDATE public.profiles SET timezone = 'UTC' WHERE timezone IS NULL;
