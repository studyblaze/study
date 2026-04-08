const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('created_at', { ascending: false })
        .limit(10);
    
    const { data: bookings } = await supabase
        .from('bookings')
        .select('id, student_id, tutor_id, topic, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    require('fs').writeFileSync('out.json', JSON.stringify({ profiles, bookings }, null, 2));
}

check();
