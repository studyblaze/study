const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAll() {
    const { data: tutors } = await supabase.from('tutors').select('*');
    console.log('Total Tutors:', tutors.length);
    console.log('Tutors details:', JSON.stringify(tutors, null, 2));
}

listAll();
