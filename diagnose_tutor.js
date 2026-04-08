
const { createClient } = require('@supabase/supabase-client');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkTutor() {
    const { data: tutors } = await supabase.from('tutors').select('id, name').ilike('name', '%shreyash%');
    console.log('Tutors:', tutors);
    if (tutors && tutors.length > 0) {
        const tid = tutors[0].id;
        
        const { count: sessionCount } = await supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('tutor_id', tid);
        const { data: sessions } = await supabase.from('sessions').select('id, status, topic, date').eq('tutor_id', tid);
        
        console.log('Total Sessions:', sessionCount);
        console.log('Sessions Data (first 5):', sessions?.slice(0, 5));
        
        const { data: bookings } = await supabase.from('bookings').select('*, sessions!inner(*)').eq('sessions.tutor_id', tid);
        console.log('Total Bookings:', bookings?.length);
        console.log('Booking Amounts:', bookings?.map(b => b.amount));
        console.log('Booking Statuses:', bookings?.map(b => b.status));
    }
}
checkTutor();
