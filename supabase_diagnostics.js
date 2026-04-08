require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const anonClient = createClient(supabaseUrl, supabaseAnonKey);
const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function runDiagnostics() {
    console.log('--- SUPABASE DIAGNOSTICS ---');

    // 1. Check raw data with Admin Client (Bypasses RLS)
    console.log('\n[Admin Client - Bypassing RLS]');
    const { data: adminProfiles, error: adminErr1 } = await adminClient.from('profiles').select('id, email, role');
    if (adminErr1) console.error('Admin Profiles Error:', adminErr1.message);
    else console.log(`Total Profiles in DB: ${adminProfiles.length}`);

    const { data: adminTutors, error: adminErr2 } = await adminClient.from('tutors').select('id, profile_id');
    if (adminErr2) console.error('Admin Tutors Error:', adminErr2.message);
    else console.log(`Total Tutors in DB: ${adminTutors.length}`);

    // 2. Check data with Anon Client (Subject to RLS)
    console.log('\n[Anon Client - Subject to RLS]');
    const { data: anonProfiles, error: anonErr1 } = await anonClient.from('profiles').select('id, email, role');
    if (anonErr1) console.error('Anon Profiles Error:', anonErr1.message);
    else console.log(`Profiles visible to anon: ${anonProfiles?.length}`);

    const { data: anonTutors, error: anonErr2 } = await anonClient.from('tutors').select('id, profile_id');
    if (anonErr2) console.error('Anon Tutors Error:', anonErr2.message);
    else console.log(`Tutors visible to anon: ${anonTutors?.length}`);

    console.log('\n--- END DIAGNOSTICS ---');
}

runDiagnostics();
