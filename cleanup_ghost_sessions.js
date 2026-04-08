const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupGhostSessions() {
    console.log("--- CLEANING UP IDENTIFIED GHOST SESSIONS ---");
    
    // The specific IDs found earlier for Mar 17th
    const ghostIds = [
        '8fa0489f-3701-4e43-96bf-6ba0898921d2',
        '847feaa0-6dd4-456a-a377-86ac3156fa2d'
    ];

    console.log(`Targeting sessions: ${ghostIds.join(', ')}`);

    for (const id of ghostIds) {
        // Double check no bookings exist
        const { data: bookings } = await supabase.from('bookings').select('id').eq('session_id', id);
        if (bookings && bookings.length > 0) {
            console.log(`SKIPPING ${id}: It actually has ${bookings.length} bookings!`);
            continue;
        }

        const { error } = await supabase.from('sessions').delete().eq('id', id);
        if (error) {
            console.error(`FAILED to delete ${id}:`, error.message);
        } else {
            console.log(`DELETED ${id} successfully.`);
        }
    }
    
    console.log("Cleanup finished.");
}

cleanupGhostSessions();
