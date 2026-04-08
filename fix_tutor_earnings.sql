-- ==========================================
-- TUTOR EARNINGS, COMMISSION & ANALYTICS FIXES
-- ==========================================

-- 1. Ensure events table has correct indexes
CREATE INDEX IF NOT EXISTS idx_events_tutor_type ON public.events(tutor_id, event_type);

-- 2. Update legacy zero-earnings for Shreyash (Admin)
UPDATE public.bookings 
SET tutor_share = amount 
WHERE tutor_share = 0 
  AND status = 'confirmed' 
  AND session_id IN (
    SELECT id FROM public.sessions 
    WHERE tutor_id IN (SELECT id FROM tutors WHERE profile_id = '54fb63ef-cc85-4c65-8d02-0787497a381d')
  );

-- 3. Update legacy zero-earnings for demo lessons for Shreyash
UPDATE public.bookings
SET tutor_share = 25, amount = 25
WHERE is_demo = TRUE 
  AND tutor_share = 0 
  AND status = 'confirmed'
  AND session_id IN (
    SELECT id FROM public.sessions 
    WHERE tutor_id IN (SELECT id FROM tutors WHERE profile_id = '54fb63ef-cc85-4c65-8d02-0787497a381d')
  );

-- 4. Update process_booking_commission function
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

        -- Use hourly_rate for subscriptions/privileged demos if amount is 0
        IF ((NEW.payment_method = 'subscription' OR NEW.is_demo = TRUE) AND (NEW.amount IS NULL OR NEW.amount = 0)) THEN
            v_base_amount := COALESCE(v_tutor_hourly_rate, 25);
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

            -- Shreyash Kale (Admin) Exception: 100% Tutor Share even for Demos
            IF (v_tutor_profile_id = '54fb63ef-cc85-4c65-8d02-0787497a381d') THEN
                NEW.tutor_share := v_base_amount;
                NEW.company_share := 0;
            ELSE
                -- Normal tutors: 100% Company Share for Demos
                NEW.company_share := v_base_amount;
                NEW.tutor_share := 0;
            END IF;
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
        END IF;

        -- Credit Tutor's Wallet (if confirmed and has share)
        IF (NEW.tutor_share > 0) THEN
            INSERT INTO public.transactions (user_id, amount, description, type, status)
            VALUES (v_tutor_profile_id, NEW.tutor_share, 'Earnings from lesson booking', 'bonus', 'completed');
        END IF;
        
        -- Increment Tutor Total Lessons
        UPDATE public.tutors 
        SET total_lessons_completed = COALESCE(total_lessons_completed, 0) + 1
        WHERE id = v_tutor_id;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Update get_tutor_analytics function
CREATE OR REPLACE FUNCTION get_tutor_analytics(p_tutor_id INTEGER)
RETURNS JSON AS $func$
DECLARE
    result JSON;
    v_profile_views INT;
    v_demo_lessons INT;
    v_subscriptions INT;
    v_avg_rating NUMERIC;
    v_total_lessons INT;
    v_completed_lessons INT;
    v_cancelled_lessons INT;
    v_missed_lessons INT;
    v_rescheduled_lessons INT;
    v_weekly_lessons INT;
    v_lessons_last_30d INT;
    v_lifetime_earnings NUMERIC;
    v_earnings_90d NUMERIC;
    v_hours_taught NUMERIC;
    v_active_students INT;
    v_new_students INT;
    v_demo_conversion_rate NUMERIC := 0;
    v_take_demo_rate NUMERIC := 0;
    v_subscribe_after_demo_rate NUMERIC := 0;
    v_cancelled_rate NUMERIC := 0;
    v_rescheduled_rate NUMERIC := 0;
    v_lesson_completion_rate NUMERIC := 0;
    v_response_rate NUMERIC := 100;
    v_tutor_activity NUMERIC := 100;
    v_profile_score NUMERIC := 0;
    v_is_elite BOOLEAN := false;
    v_earnings_history JSON;
    v_lessons_history JSON;
    v_tutor_currency TEXT;
    v_weekly_lessons_history JSON;
BEGIN
    -- Get Tutor Currency
    SELECT currency INTO v_tutor_currency FROM public.tutors WHERE id = p_tutor_id;
    IF v_tutor_currency IS NULL THEN v_tutor_currency := 'USD'; END IF;

    SELECT COUNT(*) INTO v_profile_views FROM events WHERE tutor_id = p_tutor_id AND event_type = 'profile_view';
    SELECT COUNT(*) INTO v_demo_lessons FROM events WHERE tutor_id = p_tutor_id AND event_type = 'demo_booked';
    SELECT COUNT(*) INTO v_subscriptions FROM subscriptions WHERE tutor_id = p_tutor_id AND status = 'active';
    
    BEGIN
        SELECT COALESCE(AVG(rating), 0) INTO v_avg_rating FROM reviews WHERE tutor_id = p_tutor_id;
    EXCEPTION WHEN OTHERS THEN v_avg_rating := 0; END;
    
    SELECT COUNT(*) INTO v_total_lessons FROM sessions WHERE tutor_id = p_tutor_id;
    SELECT COUNT(*) INTO v_completed_lessons FROM sessions WHERE tutor_id = p_tutor_id AND status = 'completed';
    SELECT COUNT(*) INTO v_cancelled_lessons FROM sessions WHERE tutor_id = p_tutor_id AND status = 'cancelled';
    SELECT COUNT(*) INTO v_missed_lessons FROM sessions WHERE tutor_id = p_tutor_id AND status = 'missed';
    
    -- Weekly Lessons count (fixing date comparison for YYYY-MM-DD and DD/MM/YYYY)
    SELECT COUNT(*) INTO v_weekly_lessons FROM sessions 
    WHERE tutor_id = p_tutor_id 
      AND status = 'completed' 
      AND (
        CASE 
          WHEN date::text ~ '^\d{4}-\d{2}-\d{2}$' THEN date::DATE 
          WHEN date::text ~ '^\d{2}/\d{2}/\d{4}$' THEN to_date(date::text, 'DD/MM/YYYY')
          ELSE CURRENT_DATE 
        END
      ) >= CURRENT_DATE - 7;
    
    SELECT COUNT(*) INTO v_lessons_last_30d FROM sessions 
    WHERE tutor_id = p_tutor_id 
      AND status = 'completed' 
      AND (
        CASE 
          WHEN date::text ~ '^\d{4}-\d{2}-\d{2}$' THEN date::DATE 
          WHEN date::text ~ '^\d{2}/\d{2}/\d{4}$' THEN to_date(date::text, 'DD/MM/YYYY')
          ELSE CURRENT_DATE 
        END
      ) >= CURRENT_DATE - 30;

    -- Earnings (Fixed: Sum tutor_share instead of amount)
    SELECT COALESCE(SUM(tutor_share), 0) INTO v_lifetime_earnings FROM bookings 
    WHERE session_id IN (SELECT id FROM sessions WHERE tutor_id = p_tutor_id AND status = 'completed');
    
    SELECT COALESCE(SUM(tutor_share), 0) INTO v_earnings_90d FROM bookings 
    WHERE created_at >= NOW() - INTERVAL '90 days' AND session_id IN (SELECT id FROM sessions WHERE tutor_id = p_tutor_id AND status = 'completed');
    
    v_hours_taught := v_completed_lessons; 

    SELECT COUNT(DISTINCT student_id) INTO v_active_students FROM bookings 
    WHERE session_id IN (
        SELECT id FROM sessions 
        WHERE tutor_id = p_tutor_id 
          AND status = 'completed' 
          AND (
            CASE 
              WHEN date::text ~ '^\d{4}-\d{2}-\d{2}$' THEN date::DATE 
              WHEN date::text ~ '^\d{2}/\d{2}/\d{4}$' THEN to_date(date::text, 'DD/MM/YYYY')
              ELSE CURRENT_DATE 
            END
          ) >= CURRENT_DATE - 30
    );
    
    SELECT COUNT(DISTINCT student_id) INTO v_new_students FROM subscriptions 
    WHERE tutor_id = p_tutor_id AND created_at >= NOW() - INTERVAL '30 days';

    -- Generate REAL Earnings History (Fixed: Sum tutor_share)
    SELECT json_agg(h) INTO v_earnings_history FROM (
        SELECT 
            to_char(m, 'Mon YY') as name,
            COALESCE(SUM(b.tutor_share), 0) as amount
        FROM generate_series(
            date_trunc('month', CURRENT_DATE) - INTERVAL '5 months',
            date_trunc('month', CURRENT_DATE),
            '1 month'::interval
        ) m
        LEFT JOIN bookings b ON date_trunc('month', b.created_at) = m 
            AND b.session_id IN (SELECT id FROM sessions WHERE tutor_id = p_tutor_id AND status = 'completed')
        GROUP BY m
        ORDER BY m ASC
    ) h;

    SELECT json_agg(h) INTO v_lessons_history FROM (
        SELECT 
            to_char(m, 'Mon') as name,
            COUNT(s.id) as lessons
        FROM generate_series(
            date_trunc('month', CURRENT_DATE) - INTERVAL '11 months',
            date_trunc('month', CURRENT_DATE),
            '1 month'::interval
        ) m
        LEFT JOIN sessions s ON date_trunc('month', (
            CASE 
              WHEN s.date::text ~ '^\d{4}-\d{2}-\d{2}$' THEN s.date::DATE 
              WHEN s.date::text ~ '^\d{2}/\d{2}/\d{4}$' THEN to_date(s.date::text, 'DD/MM/YYYY')
              ELSE CURRENT_DATE 
            END
        )) = m 
            AND s.tutor_id = p_tutor_id AND s.status = 'completed'
        GROUP BY m
        ORDER BY m ASC
    ) h;

    IF v_profile_views > 0 THEN v_take_demo_rate := ROUND((v_demo_lessons::NUMERIC / v_profile_views) * 100, 2); END IF;
    IF v_demo_lessons > 0 THEN v_subscribe_after_demo_rate := ROUND((v_subscriptions::NUMERIC / v_demo_lessons) * 100, 2);
    ELSE v_subscribe_after_demo_rate := 0; END IF;
    v_demo_conversion_rate := v_subscribe_after_demo_rate;
    
    IF v_total_lessons > 0 THEN
        v_cancelled_rate := ROUND((v_cancelled_lessons::NUMERIC / v_total_lessons) * 100, 2);
        v_lesson_completion_rate := ROUND((v_completed_lessons::NUMERIC / v_total_lessons) * 100, 2);
    END IF;

    v_profile_score := ROUND(
        (v_response_rate * 0.30) +
        ((v_avg_rating / 5.0 * 100) * 0.20) +
        (v_lesson_completion_rate * 0.20) +
        (v_demo_conversion_rate * 0.15) +
        (v_tutor_activity * 0.15), 
    2);
    
    -- Generate Weekly Lessons History (Daily for last 7 days)
    SELECT json_agg(h) INTO v_weekly_lessons_history FROM (
        SELECT 
            to_char(m, 'Dy d') as name,
            COUNT(s.id) as lessons
        FROM generate_series(
            CURRENT_DATE - INTERVAL '6 days',
            CURRENT_DATE,
            '1 day'::interval
        ) m
        LEFT JOIN sessions s ON (
            CASE 
              WHEN s.date::text ~ '^\d{4}-\d{2}-\d{2}$' THEN s.date::DATE 
              WHEN s.date::text ~ '^\d{2}/\d{2}/\d{4}$' THEN to_date(s.date::text, 'DD/MM/YYYY')
              ELSE CURRENT_DATE 
            END
        ) = m::DATE AND s.tutor_id = p_tutor_id AND s.status = 'completed'
        GROUP BY m
        ORDER BY m ASC
    ) h;

    IF v_demo_conversion_rate >= 50 AND v_avg_rating >= 4.8 AND v_lessons_last_30d >= 10 AND v_cancelled_rate < 5 THEN
        v_is_elite := true;
    END IF;

    result := json_build_object(
        'profile_views', v_profile_views,
        'demo_lessons', v_demo_lessons,
        'new_subscriptions', v_subscriptions,
        'demo_conversion_rate', v_demo_conversion_rate,
        'take_demo_lesson_rate', v_take_demo_rate,
        'subscribe_after_demo_rate', v_subscribe_after_demo_rate,
        'avg_rating', ROUND(v_avg_rating, 2),
        'profile_score', v_profile_score,
        'rescheduled_lessons_rate', v_rescheduled_rate,
        'cancelled_lessons_rate', v_cancelled_rate,
        'missed_lessons', v_missed_lessons,
        'weekly_lessons', v_weekly_lessons,
        'lifetime_earnings', v_lifetime_earnings,
        'earnings_last_90_days', v_earnings_90d,
        'lessons_taught', v_completed_lessons,
        'hours_taught', v_hours_taught,
        'active_students', v_active_students,
        'new_students', v_new_students,
        'is_elite_tutor', v_is_elite,
        'earnings_history', COALESCE(v_earnings_history, '[]'::json),
        'lessons_history', COALESCE(v_lessons_history, '[]'::json),
        'weekly_lessons_history', COALESCE(v_weekly_lessons_history, '[]'::json),
        'tutor_currency', v_tutor_currency
    );
    
    RETURN result;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;
