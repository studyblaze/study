const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTutors() {
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .in('id', ['6786c572-c513-460d-8386-a51b94747db5', '6786c572-c513-460d-8386-a51b94747db5']); 
    // Wait, the IDs in tutors are integers? 6 and 11?
    // Let's check tutors table again.
    
    const { data: tutors } = await supabase
        .from('tutors')
        .select('*, profile:profiles(*)');

    console.log('Tutors and Profiles:', JSON.stringify(tutors, null, 2));
}

listTutors();
