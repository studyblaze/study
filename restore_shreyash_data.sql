-- RESTORE SHREYASH DATA & FIX AMOUNT_INR
-- This script corrects the hardcoded 200 INR tutor_share and populates missing amount_inr values.

-- 1. Restore tutor_share to 100% of amount for Shreyash (Tutor ID: 3)
UPDATE public.bookings b
SET 
    tutor_share = b.amount,
    company_share = 0
FROM public.sessions s
WHERE b.session_id = s.id
  AND s.tutor_id = 3
  AND b.status = 'confirmed';

-- 2. Populate missing or zero amount_inr values for ALL tutors
-- Using approximate rates consistent with what seems to be in the DB (DKK ~14, EUR ~90)
UPDATE public.bookings
SET amount_inr = amount * 14.33
WHERE (amount_inr IS NULL OR amount_inr = 0)
  AND currency = 'DKK'
  AND amount > 0;

UPDATE public.bookings
SET amount_inr = amount * 90.0
WHERE (amount_inr IS NULL OR amount_inr = 0)
  AND currency = 'EUR'
  AND amount > 0;

UPDATE public.bookings
SET amount_inr = amount * 83.33
WHERE (amount_inr IS NULL OR amount_inr = 0)
  AND currency = 'USD'
  AND amount > 0;

UPDATE public.bookings
SET amount_inr = amount
WHERE (amount_inr IS NULL OR amount_inr = 0)
  AND (currency = 'INR' OR currency IS NULL)
  AND amount > 0;

-- 3. Ensure tutor_share_inr? No, we'll fix the analytics function to calculate it.
