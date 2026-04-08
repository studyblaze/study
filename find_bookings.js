const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exkgplqcdtoxfmxqkdpl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a2dwbHFjZHRveGZteHFrZHBsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIxMDQ3NSwiZXhwIjoyMDg3Nzg2NDc1fQ.t7Knpc2zi0qDrjQS09AJHWRDrDrpgzFRd5rmP_KvTzE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function findBookings() {
    const mahbubId = 'd9ce4e44-a0ce-41a4-aec0-086c697960b0';
    console.log('Querying for student_id:', mahbubId);

    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('student_id', mahbubId);

    if (error) {
        console.error('Error fetching bookings:', error);
        return;
    }

    console.log('Found', data.length, 'bookings:');
    console.log(JSON.stringify(data, null, 2));

    // Also check for sessions on March 9th
    const { data: sessions, error: sError } = await supabase
        .from('sessions')
        .select('*')
        .eq('date', '2026-03-09');

    if (sessions) {
        console.log('\nSessions on March 9th:');
        console.log(JSON.stringify(sessions, null, 2));
    }
}

findBookings();
