
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exkgplqcdtoxfmxqkdpl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a2dwbHFjZHRveGZteHFrZHBsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIxMDQ3NSwiZXhwIjoyMDg3Nzg2NDc1fQ.t7Knpc2zi0qDrjQS09AJHWRDrDrpgzFRd5rmP_KvTzE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: sessions } = await supabase.from('sessions').select('id, lesson_title, status, created_at');
    console.log('--- SESSIONS ---');
    console.log(JSON.stringify(sessions, null, 2));

    const { data: bookings } = await supabase.from('bookings').select('id, amount, amount_inr, company_share, created_at, status');
    console.log('--- BOOKINGS ---');
    console.log(JSON.stringify(bookings, null, 2));
}

run();
