require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function run() {
    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        // Just grab the first tutor id we can find from the valid array
        const validUserId = users.data.users[0].id;

        const { data, error } = await supabaseAdmin
            .from('recordings')
            .insert({
                tutor_id: validUserId,
                title: 'Live Session: Test Final',
                video_url: 'In Progress...',
                size_mb: '0',
                created_at: new Date().toISOString()
            })
            .select();

        fs.writeFileSync('recordings_final_debug.json', JSON.stringify({ data, error }, null, 2));
    } catch (e) {
        fs.writeFileSync('recordings_final_debug.json', JSON.stringify({ exception: e.message }, null, 2));
    }
}
run();
