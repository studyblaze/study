const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .ilike('full_name', '%CombinedFix%');
    
    const { data: bookings, error: bError } = await supabase
        .from('bookings')
        .select('id, student_id, tutor_id, topic, tutor_name, student_name')
        .ilike('topic', '%CombinedFix%');

    const { data: bookings2, error: bError2 } = await supabase
        .from('bookings')
        .select('id, student_id, tutor_id, topic, tutor_name, student_name')
        .ilike('tutor_name', '%CombinedFix%');

    require('fs').writeFileSync('out2.json', JSON.stringify({ profiles, bookings, bookings2, pError, bError, bError2 }, null, 2));
}

check();
