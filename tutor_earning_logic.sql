-- CONSOLIDATED TUTOR EARNING & COMMISSION LOGIC
-- This script merges various conflicting triggers into one clean flow.
-- It ensures Shreyash Kale (Owner) and regular tutors are credited correctly.

BEGIN;

-- 1. DROP OLD CONFLICTING TRIGGERS
DROP TRIGGER IF EXISTS tr_process_booking_commission ON public.bookings;
DROP TRIGGER IF EXISTS trg_credit_tutor_on_booking ON public.bookings;
DROP TRIGGER IF EXISTS tr_process_tutor_booking_commission ON public.bookings;

-- 2. CREATE CONSOLIDATED FUNCTION
CREATE OR REPLACE FUNCTION public.process_tutor_booking_commission()
RETURNS TRIGGER AS $$
DECLARE
    v_tutor_id INTEGER;
    v_tutor_profile_id UUID;
    v_total_completed INTEGER;
    v_is_owner BOOLEAN;
    v_share_percent DECIMAL;
    v_base_amount DECIMAL;
BEGIN
    -- Only act on CONFIRMED bookings
    IF (NEW.status = 'confirmed') THEN

        -- Fetch Tutor Details
        SELECT t.id, t.profile_id, t.total_lessons_completed, t.is_owner
        INTO v_tutor_id, v_tutor_profile_id, v_total_completed, v_is_owner
        FROM public.sessions s
        JOIN public.tutors t ON s.tutor_id = t.id
        WHERE s.id = NEW.session_id;

        IF v_tutor_profile_id IS NULL THEN
            RETURN NEW;
        END IF;

        -- Handle Base Amount
        -- If it's a subscription lesson, the student paid 0 at booking time.
        -- We set base_amount to 0 to avoid "phantom money" being added to the tutor's balance.
        -- If the tutor should be paid for subscription lessons, it should be handled 
        -- during subscription payout cycles or manually, NOT automatically per click.
        IF (NEW.payment_method = 'subscription') THEN
            v_base_amount := 0;
        ELSE
            v_base_amount := COALESCE(NEW.amount, 0);
        END IF;

        -- Calculate Share %
        IF v_is_owner OR v_tutor_profile_id = '54fb63ef-cc85-4c65-8d02-0787497a381d' THEN
            v_share_percent := 1.00;
        ELSIF v_total_completed = 0 THEN
            v_share_percent := 0.00; -- 1st lesson is platform fee
        ELSIF v_total_completed < 50 THEN
            v_share_percent := 0.60;
        ELSIF v_total_completed < 100 THEN
            v_share_percent := 0.70;
        ELSE
            v_share_percent := 0.80;
        END IF;

        -- Update Booking shares for accounting
        NEW.tutor_share := v_base_amount * v_share_percent;
        NEW.company_share := v_base_amount * (1 - v_share_percent);
        -- Sync amount in case it was null
        NEW.amount := v_base_amount;

        -- Record LEGACY transaction/wallet update IF there is real money involved
        IF (NEW.tutor_share > 0) THEN
            -- This will trigger update_wallet_balance() automatically
            INSERT INTO public.transactions (user_id, amount, description, type, status, currency, amount_inr)
            VALUES (
                v_tutor_profile_id, 
                NEW.tutor_share, 
                'Lesson Earning: ' || COALESCE(NEW.promo_code, 'Standard'), 
                'bonus', 
                'completed', 
                COALESCE(NEW.currency, 'INR'),
                COALESCE(NEW.amount_inr, 0) * v_share_percent
            );
        END IF;

        -- Increment lesson count for tier tracking
        UPDATE public.tutors 
        SET total_lessons_completed = total_lessons_completed + 1
        WHERE id = v_tutor_id;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. APPLY TRIGGER
CREATE TRIGGER tr_process_tutor_booking_commission
BEFORE INSERT OR UPDATE OF status ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.process_tutor_booking_commission();

COMMIT;

-- REFRESH SCHEMA
NOTIFY pgrst, 'reload schema';
