const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnose() {
    console.log("--- COMPREHENSIVE DIAGNOSTICS ---");

    // 1. All Profiles
    const { data: profiles } = await supabase.from('profiles').select('*');
    console.log("PROFILES FOUND:", profiles?.length);
    profiles?.forEach(p => console.log(`Profile: ${p.id} | ${p.full_name} | ${p.role}`));

    // 2. All Tutors
    const { data: tutors } = await supabase.from('tutors').select('*, profile:profiles(full_name)');
    console.log("\nTUTORS FOUND:", tutors?.length);
    tutors?.forEach(t => console.log(`Tutor: ${t.id} | Name: ${t.profile?.full_name} | ProfileID: ${t.profile_id}`));

    // 3. All Sessions
    const { data: sessions } = await supabase.from('sessions').select('*').order('created_at', { ascending: false });
    console.log("\nSESSIONS FOUND:", sessions?.length);
    sessions?.forEach(s => console.log(`Session: ${s.id} | TutorID: ${s.tutor_id} | Topic: ${s.topic} | Status: ${s.status}`));

    // 4. All Bookings
    const { data: bookings } = await supabase.from('bookings').select('*, session:sessions(topic, tutor_id), student:profiles(full_name)');
    console.log("\nBOOKINGS FOUND:", bookings?.length);
    bookings?.forEach(b => console.log(`Booking: ${b.id} | Student: ${b.student?.full_name} | SessionID: ${b.session_id} | TutorID: ${b.session?.tutor_id} | isDemo: ${b.is_demo}`));

    // 5. Recordings Table structure
    const { data: recs } = await supabase.from('recordings').select('*').limit(1);
    console.log("\nRECORDINGS SAMPLE:", recs);
}

diagnose();
