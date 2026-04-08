const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const fs = require('fs');

async function inspect() {
    let output = '';
    const log = (msg) => {
        output += msg + '\n';
        console.log(msg);
    };

    log('--- SUBSCRIPTIONS ---');
    const { data: subs, error: subErr } = await supabase
        .from('subscriptions')
        .select(`*`);
    
    if (subErr) log('Sub Error: ' + JSON.stringify(subErr));
    else log(JSON.stringify(subs, null, 2));

    log('\n--- PROFILES (Search for Mahbub/Zain) ---');
    const { data: profiles, error: profErr } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .or('full_name.ilike.%Mahb%,full_name.ilike.%Zain%,email.ilike.%Mahb%,email.ilike.%hotmail%');
    
    if (profErr) log('Profile Error: ' + JSON.stringify(profErr));
    else log(JSON.stringify(profiles, null, 2));

    log('\n--- ALL STUDENTS ---');
    const { data: allStudents, error: allStudErr } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('role', 'student');
    
    if (allStudErr) log('All Stud Error: ' + JSON.stringify(allStudErr));
    else log(`Total students: ${allStudents.length}`);

    fs.writeFileSync('debug_output.json', output);
}

inspect();
