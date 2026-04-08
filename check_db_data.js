const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkData() {
    console.log('--- Checking profiles ---');
    const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('email, role')
        .limit(10);

    if (pErr) console.error('Error fetching profiles:', pErr);
    else console.log('Profiles:', profiles);

    console.log('\n--- Checking analytics_visits ---');
    const { data: visits, error: vErr, count: vCount } = await supabase
        .from('analytics_visits')
        .select('*', { count: 'exact' });

    if (vErr) console.error('Error fetching visits:', vErr);
    else {
        const withCoords = visits.filter(v => v.latitude !== null);
        console.log(`Total Visits: ${vCount}, With Coords: ${withCoords.length}`);
    }

    console.log('\n--- Checking auth_logs ---');
    const { data: logs, error: lErr, count: lCount } = await supabase
        .from('auth_logs')
        .select('*', { count: 'exact' });

    if (lErr) console.error('Error fetching logs:', lErr);
    else console.log(`Total Logs: ${lCount}`);
}

checkData();
