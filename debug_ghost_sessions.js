const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findGhostSessions() {
    console.log("--- SEARCHING FOR GHOST SESSIONS ON TUE 17 ---");
    
    const targetDate = '2026-03-17'; // Tue 17th based on user report and today's date (Mar 16)
    
    // Find sessions on this date
    const { data: sessions, error } = await supabase
        .from('sessions')
        .select('*, bookings(*)')
        .eq('date', targetDate);

    if (error) {
        console.error("Error fetching sessions:", error);
        return;
    }

    console.log(`Found ${sessions.length} sessions on ${targetDate}`);
    
    const ghostSessions = sessions.filter(s => s.bookings.length === 0);
    
    console.log(`\nGhost Sessions (Sessions with no bookings): ${ghostSessions.length}`);
    ghostSessions.forEach(s => {
        console.log(`- ID: ${s.id} | Topic: ${s.topic} | Time: ${s.time} | Status: ${s.status} | TutorID: ${s.tutor_id}`);
    });

    // Also check for sessions with "cancelled" or "deleted" status if they are taking up space
    const cancelledSessions = sessions.filter(s => s.status === 'cancelled');
    console.log(`\nCancelled Sessions: ${cancelledSessions.length}`);
}

findGhostSessions();
