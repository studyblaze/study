const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const sql = `
-- 1. ADD MISSING COLUMN FOR PROFILE VISIBILITY
ALTER TABLE public.tutors 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE;

-- 2. CLEAR ALL RECORDINGS FOR A FRESH START
DELETE FROM public.recordings;
DELETE FROM public.class_sessions;
`;

async function migrate() {
    try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
        if (error) {
            console.error('Error running migration:', error);
        } else {
            console.log('Migration successful: Column added and data cleared.');
        }
    } catch (e) {
        console.error('Migration failed:', e);
    }
}

migrate();
 Bermuda
