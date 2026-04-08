const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const seeds = [
    { page_path: '/', source: 'organic', ip_address: '8.8.8.8', country: 'United States', city: 'Mountain View', latitude: 37.4223, longitude: -122.0841, bounced: false, session_duration_seconds: 120 },
    { page_path: '/', source: 'social', ip_address: '1.1.1.1', country: 'Australia', city: 'Sydney', latitude: -33.8688, longitude: 151.2093, bounced: false, session_duration_seconds: 45 },
    { page_path: '/find-tutors', source: 'direct', ip_address: '2.2.2.2', country: 'United Kingdom', city: 'London', latitude: 51.5074, longitude: -0.1278, bounced: false, session_duration_seconds: 300 },
    { page_path: '/apply-tutor', source: 'paid', ip_address: '3.3.3.3', country: 'Germany', city: 'Berlin', latitude: 52.5200, longitude: 13.4050, bounced: true, session_duration_seconds: 10 },
    { page_path: '/', source: 'referral', ip_address: '4.4.4.4', country: 'India', city: 'Mumbai', latitude: 19.0760, longitude: 72.8777, bounced: false, session_duration_seconds: 240 },
    { page_path: '/find-tutors', source: 'organic', ip_address: '5.5.5.5', country: 'Japan', city: 'Tokyo', latitude: 35.6762, longitude: 139.6503, bounced: false, session_duration_seconds: 180 },
    { page_path: '/', source: 'social', ip_address: '6.6.6.6', country: 'Brazil', city: 'São Paulo', latitude: -23.5505, longitude: -46.6333, bounced: false, session_duration_seconds: 95 }
];

async function seed() {
    console.log('Seeding analytics data...');
    const { data, error } = await supabase.from('analytics_visits').insert(seeds);
    if (error) {
        console.error('Error seeding:', error);
    } else {
        console.log('Successfully seeded analytics data!');
    }
}

seed();
