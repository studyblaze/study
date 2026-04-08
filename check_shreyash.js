const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTutor() {
    const { data, error } = await supabase
        .from('tutors')
        .select('*, profiles(*)')
        .ilike('profiles.full_name', '%shreyash%');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(JSON.stringify(data, null, 2));
}

checkTutor();
