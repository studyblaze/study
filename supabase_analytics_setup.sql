-- ==========================================
-- GROUPTUTORS ANALYTICS & INSIGHTS SETUP
-- ==========================================

-- 1. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    tutor_id INTEGER REFERENCES public.tutors(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, tutor_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Safely drop existing policies to avoid 42710 error
DROP POLICY IF EXISTS "Public Read Subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Auth Insert Subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Auth Update Subscriptions" ON public.subscriptions;

CREATE POLICY "Public Read Subscriptions" ON public.subscriptions FOR SELECT USING (true);
CREATE POLICY "Auth Insert Subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth Update Subscriptions" ON public.subscriptions FOR UPDATE USING (auth.role() = 'authenticated');

-- 2. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL, 
    -- 'profile_view', 'demo_booked', 'lesson_completed', 'subscription_started', 'lesson_cancelled', 'lesson_rescheduled', 'message_sent', 'review_added'
    tutor_id INTEGER REFERENCES public.tutors(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- Indexes for fast analytics queries
CREATE INDEX IF NOT EXISTS idx_events_tutor_type_time ON public.events(tutor_id, event_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_events_student ON public.events(student_id);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Safely drop existing policies just in case
DROP POLICY IF EXISTS "Public Read Events" ON public.events;
DROP POLICY IF EXISTS "Auth Insert Events" ON public.events;

CREATE POLICY "Public Read Events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Auth Insert Events" ON public.events FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Add to REALTIME publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'events'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'subscriptions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
    END IF;
END $$;


-- 3. TUTOR ANALYTICS RPC FUNCTION
-- Aggregates all tutor metrics into a single JSON object for lightweight frontend fetching
DROP FUNCTION IF EXISTS get_tutor_analytics(INTEGER);
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

    -- History arrays
    v_earnings_history JSON;
    v_lessons_history JSON;
BEGIN
    -- Event-based counts
    SELECT COUNT(*) INTO v_profile_views FROM events WHERE tutor_id = p_tutor_id AND event_type = 'profile_view';
    SELECT COUNT(*) INTO v_demo_lessons FROM events WHERE tutor_id = p_tutor_id AND event_type = 'demo_booked';
    SELECT COUNT(*) INTO v_subscriptions FROM subscriptions WHERE tutor_id = p_tutor_id AND status = 'active';
    
    -- Ratings
    BEGIN
        SELECT COALESCE(AVG(rating), 0) INTO v_avg_rating FROM reviews WHERE tutor_id = p_tutor_id;
    EXCEPTION WHEN OTHERS THEN
        v_avg_rating := 0;
    END;
    
    -- Session-based counts
    SELECT COUNT(*) INTO v_total_lessons FROM sessions WHERE tutor_id = p_tutor_id;
    SELECT COUNT(*) INTO v_completed_lessons FROM sessions WHERE tutor_id = p_tutor_id AND status = 'completed';
    SELECT COUNT(*) INTO v_cancelled_lessons FROM sessions WHERE tutor_id = p_tutor_id AND status = 'cancelled';
    SELECT COUNT(*) INTO v_missed_lessons FROM sessions WHERE tutor_id = p_tutor_id AND status = 'missed';
    
    SELECT COUNT(*) INTO v_weekly_lessons FROM sessions 
    WHERE tutor_id = p_tutor_id AND status = 'completed' AND date >= CURRENT_DATE - INTERVAL '7 days';
    
    SELECT COUNT(*) INTO v_lessons_last_30d FROM sessions 
    WHERE tutor_id = p_tutor_id AND status = 'completed' AND date >= CURRENT_DATE - INTERVAL '30 days';

    -- Earnings 
    SELECT COALESCE(SUM(amount), 0) INTO v_lifetime_earnings FROM bookings 
    WHERE session_id IN (SELECT id FROM sessions WHERE tutor_id = p_tutor_id AND status = 'completed');
    
    SELECT COALESCE(SUM(amount), 0) INTO v_earnings_90d FROM bookings 
    WHERE created_at >= NOW() - INTERVAL '90 days' AND session_id IN (SELECT id FROM sessions WHERE tutor_id = p_tutor_id AND status = 'completed');
    
    -- Hours taught
    v_hours_taught := v_completed_lessons; 

    -- Students
    SELECT COUNT(DISTINCT student_id) INTO v_active_students FROM bookings 
    WHERE session_id IN (SELECT id FROM sessions WHERE tutor_id = p_tutor_id AND status = 'completed' AND date >= CURRENT_DATE - INTERVAL '30 days');
    
    SELECT COUNT(DISTINCT student_id) INTO v_new_students FROM subscriptions 
    WHERE tutor_id = p_tutor_id AND created_at >= NOW() - INTERVAL '30 days';

    -- Generate REAL Earnings History (Last 6 Months)
    SELECT json_agg(h) INTO v_earnings_history FROM (
        SELECT 
            to_char(m, 'Mon YY') as name,
            COALESCE(SUM(b.amount), 0) as amount
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

    -- Generate REAL Lessons History (Last 12 Months)
    SELECT json_agg(h) INTO v_lessons_history FROM (
        SELECT 
            to_char(m, 'Mon') as name,
            COUNT(s.id) as lessons
        FROM generate_series(
            date_trunc('month', CURRENT_DATE) - INTERVAL '11 months',
            date_trunc('month', CURRENT_DATE),
            '1 month'::interval
        ) m
        LEFT JOIN sessions s ON date_trunc('month', s.date) = m 
            AND s.tutor_id = p_tutor_id AND s.status = 'completed'
        GROUP BY m
        ORDER BY m ASC
    ) h;

    -- Ratios
    IF v_profile_views > 0 THEN v_take_demo_rate := ROUND((v_demo_lessons::NUMERIC / v_profile_views) * 100, 2); END IF;
    IF v_demo_lessons > 0 THEN v_subscribe_after_demo_rate := ROUND((v_subscriptions::NUMERIC / v_demo_lessons) * 100, 2);
    ELSE v_subscribe_after_demo_rate := 0; END IF;
    v_demo_conversion_rate := v_subscribe_after_demo_rate;
    
    IF v_total_lessons > 0 THEN
        v_cancelled_rate := ROUND((v_cancelled_lessons::NUMERIC / v_total_lessons) * 100, 2);
        v_lesson_completion_rate := ROUND((v_completed_lessons::NUMERIC / v_total_lessons) * 100, 2);
    END IF;

    -- Profile Score Calculation
    v_profile_score := ROUND(
        (v_response_rate * 0.30) +
        ((v_avg_rating / 5.0 * 100) * 0.20) +
        (v_lesson_completion_rate * 0.20) +
        (v_demo_conversion_rate * 0.15) +
        (v_tutor_activity * 0.15), 
    2);
    
    -- Elite Tutor Eligibility
    IF v_demo_conversion_rate >= 50 
       AND v_avg_rating >= 4.8 
       AND v_lessons_last_30d >= 10 
       AND v_cancelled_rate < 5 THEN
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
        'lessons_history', COALESCE(v_lessons_history, '[]'::json)
    );
    
    RETURN result;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;
