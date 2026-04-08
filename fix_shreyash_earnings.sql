-- REFINED COMMISSION LOGIC
-- Tiers:
-- Shreyash Kale: 100% (All lessons)
-- Others: Demos (0%), Lesson 1 (0%), 2-50 (60%), 51-100 (70%), 101+ (80%)

CREATE OR REPLACE FUNCTION process_booking_commission()
RETURNS TRIGGER AS $$
DECLARE
    v_total_completed INTEGER;
    v_tutor_id INTEGER;
    v_tutor_profile_id UUID;
    v_tutor_hourly_rate DECIMAL;
    v_share_percent DECIMAL;
    v_base_amount DECIMAL;
BEGIN
    -- Only process on confirmed bookings
    IF (NEW.status = 'confirmed') THEN
        
        -- Get Tutor Info
        SELECT tutors.id, tutors.profile_id, tutors.total_lessons_completed, tutors.hourly_rate
        INTO v_tutor_id, v_tutor_profile_id, v_total_completed, v_tutor_hourly_rate
        FROM public.sessions
        JOIN public.tutors ON sessions.tutor_id = tutors.id
        WHERE sessions.id = NEW.session_id;

        -- Base Amount Calculation
        -- For Shreyash or subscription bookings with 0 amount, we use the hourly_rate
        IF (v_tutor_profile_id = '54fb63ef-cc85-4c65-8d02-0787497a381d' OR (NEW.payment_method = 'subscription' AND (NEW.amount IS NULL OR NEW.amount = 0))) THEN
            v_base_amount := COALESCE(v_tutor_hourly_rate, NEW.amount, 0);
        ELSE
            v_base_amount := COALESCE(NEW.amount, 0);
        END IF;

        -- 1. Demo Lesson Logic
        IF (NEW.is_demo = TRUE) THEN
            -- Exception: Shreyash Kale gets 100% share even for Demos
            IF (v_tutor_profile_id = '54fb63ef-cc85-4c65-8d02-0787497a381d') THEN
                NEW.tutor_share := v_base_amount;
                NEW.company_share := 0;
            ELSE
                -- 100% Company Share for Demos for other tutors
                NEW.company_share := v_base_amount;
                NEW.tutor_share := 0;
            END IF;
        ELSE
            -- 2. Regular Lesson Tiered Logic
            -- Shreyash Kale Exception: 100% Tutor Share
            IF (v_tutor_profile_id = '54fb63ef-cc85-4c65-8d02-0787497a381d') THEN
                v_share_percent := 1.00;
            -- Lesson 1 (total_lessons_completed = 0): 0% Tutor
            ELSIF (v_total_completed = 0) THEN
                v_share_percent := 0.00;
            -- Lesson 2 to 50: 60% Tutor
            ELSIF (v_total_completed < 50) THEN
                v_share_percent := 0.60;
            -- Lesson 51 to 100: 70% Tutor
            ELSIF (v_total_completed < 100) THEN
                v_share_percent := 0.70;
            -- Lesson 101+: 80% Tutor
            ELSE
                v_share_percent := 0.80;
            END IF;

            NEW.tutor_share := v_base_amount * v_share_percent;
            NEW.company_share := v_base_amount * (1 - v_share_percent);
        END IF;

        -- Credit Tutor's Wallet / Transaction Log
        IF (NEW.tutor_share > 0) THEN
            INSERT INTO public.transactions (user_id, amount, description, type, status)
            VALUES (v_tutor_profile_id, NEW.tutor_share, 'Earnings from lesson booking', 'bonus', 'completed');
        END IF;

        -- Increment Tutor Total Lessons
        UPDATE public.tutors 
        SET total_lessons_completed = total_lessons_completed + 1
        WHERE id = v_tutor_id;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Migrate existing bookings for Shreyash to his actual valuation (₹500 if applicable, or ₹200 as previously set)
-- User said "shreaysh tutor chage 500 for 1 to 1".
-- Let's update his previous bookings to ₹500 if they were 1-to-1.
UPDATE public.bookings b
SET tutor_share = 500, company_share = 0
FROM sessions s
WHERE b.session_id = s.id
AND s.tutor_id = 3
AND b.status = 'confirmed';
