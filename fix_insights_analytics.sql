-- UPDATED TUTOR ANALYTICS FUNCTION
-- Now uses tutor_share instead of amount to reflect true earnings for tutors with special rates (like Shreyash).

CREATE OR REPLACE FUNCTION get_tutor_analytics(p_tutor_id INTEGER)
RETURNS JSON AS $$
DECLARE
    v_lifetime_earnings DECIMAL := 0;
    v_earnings_last_90_days DECIMAL := 0;
    v_total_lessons INTEGER := 0;
    v_active_students INTEGER := 0;
    v_avg_rating DECIMAL := 0;
    v_profile_score INTEGER := 0;
    v_hours_taught DECIMAL := 0;
    v_missed_lessons INTEGER := 0;
    v_cancelled_lessons_rate DECIMAL := 0;
    v_weekly_lessons DECIMAL := 0;
    v_new_students INTEGER := 0;
    v_demo_lessons INTEGER := 0;
    v_new_subscriptions INTEGER := 0;
    v_demo_conversion_rate DECIMAL := 0;
    v_profile_views INTEGER := 0;
    v_is_elite_tutor BOOLEAN := FALSE;
    v_earnings_history JSON;
    v_lessons_history JSON;
    v_weekly_lessons_history JSON;
    v_tutor_currency TEXT := '₹'; -- Default for India
BEGIN
    -- Get tutor's preferred currency
    SELECT 
        CASE 
            WHEN (application_data->>'location') ILIKE '%India%' OR (application_data->>'currency') = 'INR' THEN 'INR'
            WHEN (application_data->>'currency') = 'USD' THEN 'USD'
            ELSE 'INR'
        END INTO v_tutor_currency
    FROM tutors 
    WHERE id = p_tutor_id;

    -- Earnings (REFINED: Sum the actual TUTOR SHARE they earned)
    SELECT COALESCE(SUM(tutor_share), 0) INTO v_lifetime_earnings 
    FROM bookings 
    WHERE status = 'confirmed' 
    AND session_id IN (SELECT id FROM sessions WHERE tutor_id = p_tutor_id);

    -- Last 90 days earnings history
    SELECT json_agg(h) INTO v_earnings_history FROM (
        SELECT 
            to_char(m, 'DD Mon') as name,
            COALESCE(SUM(b.tutor_share), 0) as amount
        FROM generate_series(
            CURRENT_DATE - INTERVAL '90 days',
            CURRENT_DATE,
            '1 day'::interval
        ) m
        LEFT JOIN sessions s ON s.date = m AND s.tutor_id = p_tutor_id
        LEFT JOIN bookings b ON b.session_id = s.id AND b.status = 'confirmed'
        GROUP BY m
        ORDER BY m
    ) h;

    -- Last 90 days total
    SELECT COALESCE(SUM(tutor_share), 0) INTO v_earnings_last_90_days
    FROM bookings 
    WHERE status = 'confirmed' 
    AND created_at >= CURRENT_DATE - INTERVAL '90 days'
    AND session_id IN (SELECT id FROM sessions WHERE tutor_id = p_tutor_id);

    -- v_total_lessons: Total sessions with confirmed bookings
    SELECT COUNT(DISTINCT s.id) INTO v_total_lessons 
    FROM sessions s
    JOIN bookings b ON s.id = b.session_id
    WHERE s.tutor_id = p_tutor_id AND b.status = 'confirmed';

    -- Active students: Distinct students with confirmed bookings
    SELECT COUNT(DISTINCT student_id) INTO v_active_students
    FROM bookings 
    WHERE status = 'confirmed'
    AND session_id IN (SELECT id FROM sessions WHERE tutor_id = p_tutor_id);

    -- New Students (Last 30 days)
    SELECT COUNT(DISTINCT student_id) INTO v_new_students
    FROM bookings
    WHERE status = 'confirmed'
    AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    AND session_id IN (SELECT id FROM sessions WHERE tutor_id = p_tutor_id);

    -- Profile Score & Rating
    SELECT rating, (profile_score + 40) -- Basic score + bump for verified
    INTO v_avg_rating, v_profile_score
    FROM (
        SELECT 
            COALESCE(rating, 0) as rating,
            CASE WHEN (application_data?& array['bio', 'subject', 'experience']) THEN 40 ELSE 20 END as profile_score
        FROM tutors WHERE id = p_tutor_id
    ) t;

    -- Hours Taught (Total)
    SELECT COALESCE(COUNT(*) * 1.0, 0) INTO v_hours_taught
    FROM sessions 
    WHERE tutor_id = p_tutor_id AND status = 'completed';

    -- Weekly Momentum (Last 7 days daily)
    SELECT json_agg(d) INTO v_weekly_lessons_history FROM (
        SELECT 
            to_char(m, 'Dy') as name,
            COUNT(s.id) as lessons
        FROM generate_series(
            CURRENT_DATE - INTERVAL '6 days',
            CURRENT_DATE,
            '1 day'::interval
        ) m
        LEFT JOIN sessions s ON s.date = m AND s.tutor_id = p_tutor_id AND s.status IN ('completed', 'scheduled', 'live')
        GROUP BY m
        ORDER BY m
    ) d;

    -- Average weekly lessons (avg of last 4 weeks)
    SELECT COALESCE(COUNT(*)/4.0, 0) INTO v_weekly_lessons
    FROM sessions
    WHERE tutor_id = p_tutor_id 
    AND date >= CURRENT_DATE - INTERVAL '28 days'
    AND status IN ('completed', 'scheduled', 'live');

    -- Returns
    RETURN json_build_object(
        'lifetime_earnings', v_lifetime_earnings,
        'earnings_last_90_days', v_earnings_last_90_days,
        'lessons_taught', v_total_lessons,
        'active_students', v_active_students,
        'avg_rating', v_avg_rating,
        'profile_score', v_profile_score,
        'hours_taught', v_hours_taught,
        'weekly_lessons', v_weekly_lessons,
        'new_students', v_new_students,
        'earnings_history', v_earnings_history,
        'weekly_lessons_history', v_weekly_lessons_history,
        'tutor_currency', v_tutor_currency
    );
END;
$$ LANGUAGE plpgsql;
