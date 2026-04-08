-- Add currency and original amount tracking to bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS amount_inr DECIMAL;

-- Set defaults for existing bookings based on profile currency if possible, or just 'INR'
UPDATE public.bookings b
SET currency = COALESCE(p.currency, 'INR'),
    amount_inr = b.amount -- For old bookings, we assume amount was already in INR or close enough for legacy
FROM public.profiles p
WHERE b.student_id = p.id;
