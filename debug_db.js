const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugAll() {
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, email, role');
    const { data: bookings } = await supabase.from('bookings').select('*, student:profiles(full_name), session:sessions(*)');
    const { data: tutors } = await supabase.from('tutors').select('*, profile:profiles(full_name)');

    console.log("--- PROFILES ---");
    profiles.forEach(p => console.log(`${p.id} | ${p.role} | ${p.full_name} | ${p.email}`));

    console.log("\n--- TUTORS ---");
    tutors.forEach(t => console.log(`${t.id} | ${t.profile?.full_name} | ProfileID: ${t.profile_id}`));

    console.log("\n--- BOOKINGS ---");
    bookings.forEach(b => {
        console.log(`Booking: ${b.id} | Student: ${b.student?.full_name} | TutorID: ${b.session?.tutor_id} | Session: ${b.session?.topic} | Status: ${b.status}`);
    });
}

debugAll();
