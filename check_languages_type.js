const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read env for credentials
const envPath = path.join(process.cwd(), '.env.local');
const env = fs.readFileSync(envPath, 'utf8');
const supabaseUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const supabaseAnonKey = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1];

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnose() {
    console.log('Fetching sample tutor data...');
    const { data, error } = await supabase
        .from('tutors')
        .select('languages')
        .limit(1);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (data && data.length > 0) {
        const languages = data[0].languages;
        console.log('Sample languages data:', languages);
        console.log('Type of languages:', typeof languages);
        console.log('Is array:', Array.isArray(languages));
        if (Array.isArray(languages) && languages.length > 0) {
            console.log('Sample element type:', typeof languages[0]);
        }
    } else {
        console.log('No tutors found.');
    }
}

diagnose();
