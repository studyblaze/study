const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listAll() {
    const { data: profiles } = await supabase.from('profiles').select('*');
    console.log(JSON.stringify(profiles, null, 2));
}

listAll();
