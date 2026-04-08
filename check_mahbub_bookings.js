const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkData() {
    // 1. Find Mahbub's ID
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('email', 'mahbubbamiani@hotmail.com')
        .single();

    console.log('Mahbub Profile:', profile);

    if (!profile) return;

    // 2. Find Shreyash Kale's ID (Tutor ID 3)
    const { data: tutor } = await supabase
        .from('tutors')
        .select('id, name, profile_id')
        .eq('id', 3)
        .single();

    console.log('Shreyash Tutor:', tutor);

    // 3. Check for sessions and bookings between them
    const { data: sessions } = await supabase
        .from('sessions')
        .select('id, tutor_id')
        .eq('tutor_id', 3);

    const sessionIds = sessions.map(s => s.id);
    console.log('Shreyash Sessions:', sessionIds);

    if (sessionIds.length > 0) {
        const { data: bookings } = await supabase
            .from('bookings')
            .select('*')
            .in('session_id', sessionIds)
            .eq('student_id', profile.id);

        console.log('Bookings for Mahbub with Shreyash:', bookings);
    } else {
        console.log('No sessions found for Shreyash.');
    }
}

checkData();
