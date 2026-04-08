const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listSessions() {
    const { data: sessions } = await supabase.from('sessions').select('*');
    console.log("ALL SESSIONS:");
    console.log(JSON.stringify(sessions, null, 2));

    const { data: bookings } = await supabase.from('bookings').select('id, session_id, student_id');
    console.log("\nALL BOOKINGS:");
    console.log(JSON.stringify(bookings, null, 2));
}

listSessions();
