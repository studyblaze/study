const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnose() {
    console.log("--- GRANULAR AUDIT FOR MAHUB ---");

    // 1. Find Mahub Profile
    const { data: mahubProfile } = await supabase
        .from('profiles')
        .select('*')
        .ilike('full_name', '%mahub%')
        .single();

    if (!mahubProfile) {
        console.log("Mahub profile NOT FOUND by name 'mahub'");
    } else {
        console.log("Mahub Profile Found:", JSON.stringify(mahubProfile, null, 2));

        // 2. Find Mahub Tutor Record
        const { data: mahubTutor } = await supabase
            .from('tutors')
            .select('*')
            .eq('profile_id', mahubProfile.id)
            .single();

        if (!mahubTutor) {
            console.log("Mahub profile has NO entry in 'tutors' table.");
        } else {
            console.log("Mahub Tutor Record:", JSON.stringify(mahubTutor, null, 2));

            // 3. Find Sessions for this TutorID
            const { data: mahubSessions } = await supabase
                .from('sessions')
                .select('*, bookings(*)')
                .eq('tutor_id', mahubTutor.id);

            console.log(`Sessions found for TutorID ${mahubTutor.id}:`, mahubSessions ? mahubSessions.length : 0);
            if (mahubSessions && mahubSessions.length > 0) {
                mahubSessions.forEach(s => {
                    console.log(`Session: ${s.id} | Topic: ${s.topic} | BookingCount: ${s.bookings?.length}`);
                });
            }
        }
    }

    // 4. Find Shreyash Kale's Bookings
    const { data: shreyashProfile } = await supabase
        .from('profiles')
        .select('*')
        .ilike('full_name', '%shreyash%')
        .single();

    if (shreyashProfile) {
        console.log("Shreyash Profile Found:", shreyashProfile.id);
        const { data: bookings } = await supabase
            .from('bookings')
            .select('*, session:sessions(*)')
            .eq('student_id', shreyashProfile.id);

        console.log(`Shreyash's Bookings found:`, bookings?.length);
        bookings?.forEach(b => {
            console.log(`Booking: ${b.id} | SessionID: ${b.session_id} | TutorID in Session: ${b.session?.tutor_id} | isDemo: ${b.is_demo}`);
        });
    }

    // 5. Check all bookings for any Mahub name mention or potential mis-linkage
    const { data: allBookings } = await supabase
        .from('bookings')
        .select('*, student:profiles(full_name), session:sessions(*, tutor:tutors(*, profile:profiles(full_name)))');

    console.log("\n--- SEARCHING ALL BOOKINGS ---");
    allBookings?.forEach(b => {
        const studentName = b.student?.full_name;
        const tutorName = b.session?.tutor?.profile?.full_name;
        if (studentName?.toLowerCase().includes('shreyash') || tutorName?.toLowerCase().includes('mahub')) {
            console.log(`MATCH FOUND: Student [${studentName}] booked Tutor [${tutorName}] | SessionID: ${b.session_id} | TutorID: ${b.session?.tutor_id}`);
        }
    });
}

diagnose();
