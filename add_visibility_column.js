const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const sql = `
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tutors' AND column_name='is_visible') THEN 
        ALTER TABLE public.tutors ADD COLUMN is_visible BOOLEAN DEFAULT TRUE; 
    END IF; 
END $$;
`;

async function run() {
    const { data, error } = await supabase.rpc('exec_sql', { sql: sql });
    if (error) {
        console.error('ERROR:', error);
    } else {
        console.log('SUCCESS: Migration complete.');
    }
}

run();
