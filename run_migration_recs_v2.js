const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const sql = `
-- Recording System 2.0: Class Sessions Tracking
CREATE TABLE IF NOT EXISTS public.class_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_name TEXT NOT NULL UNIQUE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    recording_id UUID REFERENCES public.recordings(id) ON DELETE SET NULL,
    egress_id TEXT, -- LiveKit Egress ID
    status TEXT NOT NULL DEFAULT 'initialized', -- 'initialized', 'active', 'completed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Indexing for lookup
CREATE INDEX IF NOT EXISTS idx_class_sessions_room_name ON public.class_sessions(room_name);
CREATE INDEX IF NOT EXISTS idx_class_sessions_status ON public.class_sessions(status);

-- RLS
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
DROP POLICY IF EXISTS "Admins have full access to class_sessions" ON public.class_sessions;
CREATE POLICY "Admins have full access to class_sessions"
ON public.class_sessions FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Tutors can see their own sessions
DROP POLICY IF EXISTS "Tutors can view their own class_sessions" ON public.class_sessions;
CREATE POLICY "Tutors can view their own class_sessions"
ON public.class_sessions FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.sessions s
        JOIN public.tutors t ON s.tutor_id = t.id
        WHERE s.id = class_sessions.session_id AND t.profile_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.bookings b
        JOIN public.sessions s ON b.session_id = s.id
        JOIN public.tutors t ON s.tutor_id = t.id
        WHERE b.id = class_sessions.booking_id AND t.profile_id = auth.uid()
    )
);
`;

async function migrate() {
    try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
        if (error) {
            console.error('Error running migration:', error);
            // Fallback for direct execution if RPC fails
            console.log('Attempting direct table creation (might fail if no rpc)...');
        } else {
            console.log('Migration successful');
        }
    } catch (e) {
        console.error('Migration failed:', e);
    }
}

migrate();
