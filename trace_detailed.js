const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runQueries() {
    console.log("--- TUTOR MAPPING ---");
    const { data: tutors, error: tErr } = await supabase.rpc('get_tutor_details_debug'); // If RPC exists, else use raw select

    // Using raw select if RPC fails or non-existent
    const { data: tutorsRaw } = await supabase
        .from('tutors')
        .select(`
            id,
            profile_id,
            profile:profiles(full_name)
        `);

    console.log("TUTORS:");
    tutorsRaw?.forEach(t => console.log(`TutorID: ${t.id} | Name: ${t.profile?.full_name} | ProfileID: ${t.profile_id}`));

    console.log("\n--- BOOKINGS AUDIT ---");
    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
            id,
            is_demo,
            status,
            student_id,
            student:profiles(full_name),
            session:sessions(
                id,
                tutor_id,
                topic,
                tutor:tutors(
                    profile:profiles(full_name)
                )
            )
        `);

    bookings?.forEach(b => {
        console.log(`Booking: ${b.id} | Student: ${b.student?.full_name} | Tutor: ${b.session?.tutor?.profile?.full_name} (TutorID: ${b.session?.tutor_id}) | isDemo: ${b.is_demo} | Session: ${b.session?.topic}`);
    });
}

runQueries();
