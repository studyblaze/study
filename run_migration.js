require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function runMigration() {
    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        console.log('Running migration...');
        const migrationSql = fs.readFileSync('add_duration_to_sessions.sql', 'utf8');

        // We use the postgres endpoint or rpc if available, but for many migrations
        // we can just run them via the service role key if we have a function to execute SQL
        // Alternatively, since we can't run raw SQL via the JS client without an RPC, 
        // we'll try to check if the column exists and add it if not using the client's schema awareness

        console.log('Adding duration_minutes to sessions...');
        const { error: sessionError } = await supabaseAdmin.from('sessions').select('duration_minutes').limit(1);

        if (sessionError && sessionError.message.includes('column "duration_minutes" does not exist')) {
            console.log('Column missing, please run the SQL in add_duration_to_sessions.sql manually in the Supabase Dashboard.');
            fs.writeFileSync('migration_status.json', JSON.stringify({
                status: 'manual_intervention_required',
                message: 'Column duration_minutes missing. Run add_duration_to_sessions.sql in Supabase SQL Editor.',
                sql: migrationSql
            }, null, 2));
        } else if (!sessionError) {
            console.log('Column already exists.');
            fs.writeFileSync('migration_status.json', JSON.stringify({ status: 'success', message: 'Column already exists' }, null, 2));
        } else {
            console.error('Error checking column:', sessionError.message);
            fs.writeFileSync('migration_status.json', JSON.stringify({ status: 'error', message: sessionError.message }, null, 2));
        }

    } catch (e) {
        console.error('Migration exception:', e.message);
        fs.writeFileSync('migration_status.json', JSON.stringify({ exception: e.message }, null, 2));
    }
}
runMigration();
