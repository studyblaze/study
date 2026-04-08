const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runFix() {
    console.log('Starting recordings migration fix...');
    
    // Step 1: Get all recordings and their current tutor_id
    const { data: recordings, error: recError } = await supabase
        .from('recordings')
        .select('id, tutor_id');
    
    if (recError) {
        console.error('Error fetching recordings:', recError);
        return;
    }

    console.log(`Found ${recordings.length} recordings.`);

    // Step 2: Get all tutors for mapping
    const { data: tutors, error: tutorError } = await supabase
        .from('tutors')
        .select('id, profile_id');

    if (tutorError) {
        console.error('Error fetching tutors:', tutorError);
        return;
    }

    const tutorMap = new Map();
    tutors.forEach(t => tutorMap.set(String(t.id), t.profile_id));

    // Step 3: Update recordings if the tutor_id matches a tutor.id (integer)
    let updatedCount = 0;
    for (const rec of recordings) {
        const profileId = tutorMap.get(String(rec.tutor_id));
        if (profileId && profileId !== rec.tutor_id) {
            console.log(`Updating recording ${rec.id}: ${rec.tutor_id} -> ${profileId}`);
            const { error: updateError } = await supabase
                .from('recordings')
                .update({ tutor_id: profileId })
                .eq('id', rec.id);
            
            if (updateError) {
                console.error(`Failed to update recording ${rec.id}:`, updateError);
            } else {
                updatedCount++;
            }
        }
    }

    console.log(`Successfully fixed ${updatedCount} recordings.`);
}

runFix();
