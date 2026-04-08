
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://exkgplqcdtoxfmxqkdpl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a2dwbHFjZHRveGZteHFrZHBsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIxMDQ3NSwiZXhwIjoyMDg3Nzg2NDc1fQ.t7Knpc2zi0qDrjQS09AJHWRDrDrpgzFRd5rmP_KvTzE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    try {
        const sql = fs.readFileSync('add_ga_credentials_to_settings.sql', 'utf8');
        // Since we can't reliably use rpc('exec_sql'), we'll try to update the table directly if columns were added,
        // or we'll just inform the user we're ready to add them.

        const { error: updateError } = await supabase
            .from('site_settings')
            .update({
                ga_property_id: '526628970',
                ga_client_email: 'grouptutors-analytics@exkgplqcdtoxfmxqkdpl.iam.gserviceaccount.com'
            })
            .eq('id', 1);

        if (updateError) {
            console.log('Columns likely missing. Need to run migration via dashboard or RPC.');
            console.log('Error details:', updateError.message);
        } else {
            console.log('Successfully updated site_settings with default GA credentials.');
        }
    } catch (err) {
        console.error('Migration script error:', err.message);
    }
}

runMigration();
