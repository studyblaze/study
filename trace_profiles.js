const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listAll() {
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, role');
    console.log("PROFILES:");
    profiles.forEach(p => console.log(`${p.id} | ${p.role} | ${p.full_name}`));

    console.log("\nBOOKINGS FOR SHREYASH KALE (fb7766fb-7db1-4f00-ae4f-2bd):");
    const { data: bks } = await supabase.from('bookings').select('*, session:sessions(*)').eq('student_id', 'fb7766fb-7db1-4f00-ae4f-2bd');
    console.log(JSON.stringify(bks, null, 2));
}

listAll();
