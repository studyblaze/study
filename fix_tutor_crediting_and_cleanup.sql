-- 1. FIX THE TUTOR CREDIT TRIGGER
-- Correct the logic to use 'tutor_share' instead of total 'amount'
CREATE OR REPLACE FUNCTION public.handle_tutor_credit_on_booking()
RETURNS TRIGGER AS $$
DECLARE v_tutor_profile_id UUID;
BEGIN
    IF (NEW.status = 'confirmed') THEN
        SELECT t.profile_id INTO v_tutor_profile_id 
        FROM public.sessions s 
        JOIN public.tutors t ON s.tutor_id = t.id 
        WHERE s.id = NEW.session_id;

        IF v_tutor_profile_id IS NOT NULL THEN
            -- Use NEW.tutor_share instead of NEW.amount
            INSERT INTO public.transactions (user_id, amount, description, type, status, currency, amount_inr)
            VALUES (
                v_tutor_profile_id, 
                CAST(COALESCE(NEW.tutor_share, 0) AS DECIMAL), 
                'Student Booking Credit', 
                'bonus', 
                'completed', 
                NEW.currency, 
                COALESCE(NEW.tutor_share, 0)
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. CLEANUP & ADJUST BALANCE FOR SHREYASH KALE
-- User Shreyash Kale (CTO/Tutor) ID: 54fb63ef-cc85-4c65-8d02-0787497a381d
-- We will remove erroneous credit transactions and add the missing 10 DKK (142 INR)
DO $$
DECLARE
    v_shreyash_id UUID := '54fb63ef-cc85-4c65-8d02-0787497a381d';
BEGIN
    -- Delete the erroneous credit transactions (both types)
    -- This removes all "Student Booking Credit" and "Earnings for session" that might be inflated
    DELETE FROM public.transactions 
    WHERE user_id = v_shreyash_id 
      AND (description LIKE 'Student Booking Credit%' OR description LIKE 'Earnings for session%');

    -- Reset and then ADD the missing 142 INR (10 DKK)
    -- The user explicitly requested to add 142 INR (10 DKK) for a session from last week.
    UPDATE public.wallets 
    SET balance = 142, 
        updated_at = NOW() 
    WHERE user_id = v_shreyash_id;

    -- If no wallet exists, create one with 142 INR
    INSERT INTO public.wallets (user_id, balance, currency)
    VALUES (v_shreyash_id, 142, 'INR')
    ON CONFLICT (user_id) DO UPDATE SET balance = 142;
    
    -- Record the 10 DKK (142 INR) manual credit as a definitive transaction
    INSERT INTO public.transactions (user_id, amount, description, type, status, currency, amount_inr)
    VALUES (v_shreyash_id, 142, 'Manual Balance Adjust (10 DKK Session - Last Week)', 'bonus', 'completed', 'INR', 142);

END $$;

-- 3. REFRESH SCHEMA
NOTIFY pgrst, 'reload schema';
