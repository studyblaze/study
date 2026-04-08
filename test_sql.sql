-- Simplest possible version for testing
CREATE OR REPLACE FUNCTION get_tutor_analytics(p_tutor_id INTEGER)
RETURNS JSON AS $func$
BEGIN
    RETURN json_build_object('status', 'ok', 'tutor_id', p_tutor_id);
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;
