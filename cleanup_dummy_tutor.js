const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
    console.log('Searching for dummy tutors...');
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .or('full_name.ilike.%tutor%,full_name.ilike.%dummy%');

    if (pError) {
        console.error('Error fetching profiles:', pError);
        return;
    }

    console.log(`Found ${profiles.length} potential dummy profiles:`, profiles.map(p => ({ id: p.id, name: p.full_name, email: p.email })));

    for (const p of profiles) {
        if (p.full_name === 'Tutor' || p.email.includes('dummy')) {
            console.log(`Deleting dummy tutor: ${p.full_name} (${p.id})`);
            // Delete from tutors table first due to FK
            await supabase.from('tutors').delete().eq('profile_id', p.id);
            // Delete from profiles
            const { error: dError } = await supabase.from('profiles').delete().eq('id', p.id);
            if (dError) console.error(`Failed to delete profile ${p.id}:`, dError);
            else console.log(`Successfully deleted ${p.full_name}`);
        }
    }
}

cleanup();
