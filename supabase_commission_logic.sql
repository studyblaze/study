-- Commission & Demo Lesson Logic Migration

-- 1. Extend Tutors Table
ALTER TABLE public.tutors 
ADD COLUMN IF NOT EXISTS total_lessons_completed INTEGER DEFAULT 0;

-- 2. Extend Bookings Table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('razorpay', 'wallet', 'subscription')) DEFAULT 'razorpay',
ADD COLUMN IF NOT EXISTS tutor_share DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS company_share DECIMAL DEFAULT 0;

-- 3. Function to Calculate Commission & Process Payout
CREATE OR REPLACE FUNCTION process_booking_commission()
RETURNS TRIGGER AS $$
DECLARE
    v_total_completed INTEGER;
    v_tutor_id INTEGER;
    v_tutor_profile_id UUID;
    v_tutor_hourly_rate DECIMAL;
    v_share_percent DECIMAL;
    v_student_month_demos INTEGER;
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

        -- Use hourly_rate for subscriptions if amount is 0
        IF (NEW.payment_method = 'subscription' AND (NEW.amount IS NULL OR NEW.amount = 0)) THEN
            v_base_amount := v_tutor_hourly_rate;
            NEW.amount := v_base_amount;
        ELSE
            v_base_amount := NEW.amount;
        END IF;

        -- 1. Demo Lesson Logic
        IF (NEW.is_demo = TRUE) THEN
            -- Check student limit (3 per month)
            SELECT COUNT(*) INTO v_student_month_demos
            FROM public.bookings
            WHERE student_id = NEW.student_id
              AND is_demo = TRUE
              AND status = 'confirmed'
              AND created_at >= date_trunc('month', CURRENT_DATE);

            IF (v_student_month_demos >= 3) THEN
                RAISE EXCEPTION 'Demo lesson limit (3/month) reached for this student.';
            END IF;

            -- 100% Company Share for Demos
            NEW.company_share := v_base_amount;
            NEW.tutor_share := 0;
        ELSE
            -- 2. Regular Lesson Tiered Logic
            -- Shreyash Kale (Profile ID: 54fb63ef-cc85-4c65-8d02-0787497a381d) Exception: 100% Tutor Share
            IF (v_tutor_profile_id = '54fb63ef-cc85-4c65-8d02-0787497a381d') THEN
                v_share_percent := 1.00;
            -- 1st Lesson (total_lessons_completed = 0): 0% Tutor (100% platform)
            ELSIF (v_total_completed = 0) THEN
                v_share_percent := 0.00;
            -- 2nd to 50th Lesson: 60% Tutor (40% platform)
            ELSIF (v_total_completed < 50) THEN
                v_share_percent := 0.60;
            -- 51st to 100th Lesson: 70% Tutor (30% platform)
            ELSIF (v_total_completed < 100) THEN
                v_share_percent := 0.70;
            -- 101+ Lessons: 80% Tutor (20% platform)
            ELSE
                v_share_percent := 0.80;
            END IF;

            NEW.tutor_share := v_base_amount * v_share_percent;
            NEW.company_share := v_base_amount * (1 - v_share_percent);
            
            -- Credit Tutor's Wallet
            IF (NEW.tutor_share > 0) THEN
                INSERT INTO public.transactions (user_id, amount, description, type, status)
                VALUES (v_tutor_profile_id, NEW.tutor_share, 'Earnings from lesson booking', 'bonus', 'completed');
            END IF;
            
            -- Increment Tutor Total Lessons
            UPDATE public.tutors 
            SET total_lessons_completed = total_lessons_completed + 1
            WHERE id = v_tutor_id;
        END IF;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create Trigger
DROP TRIGGER IF EXISTS tr_process_booking_commission ON public.bookings;
CREATE TRIGGER tr_process_booking_commission
BEFORE INSERT OR UPDATE OF status ON public.bookings
FOR EACH ROW EXECUTE FUNCTION process_booking_commission();

-- 5. Helper View for Admin Panel
CREATE OR REPLACE VIEW public.admin_commission_stats AS
SELECT 
    SUM(company_share) as total_platform_revenue,
    SUM(tutor_share) as total_tutor_payouts,
    COUNT(CASE WHEN is_demo THEN 1 END) as total_demos
FROM public.bookings
WHERE status = 'confirmed';
