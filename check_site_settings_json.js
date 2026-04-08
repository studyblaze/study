
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://exkgplqcdtoxfmxqkdpl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a2dwbHFjZHRveGZteHFrZHBsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIxMDQ3NSwiZXhwIjoyMDg3Nzg2NDc1fQ.t7Knpc2zi0qDrjQS09AJHWRDrDrpgzFRd5rmP_KvTzE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .limit(1);

        if (error) {
            fs.writeFileSync('site_settings_final.json', JSON.stringify({ error: error.message }, null, 2));
        } else if (data && data.length > 0) {
            fs.writeFileSync('site_settings_final.json', JSON.stringify(data[0], null, 2));
        } else {
            fs.writeFileSync('site_settings_final.json', JSON.stringify({ message: 'No data found' }, null, 2));
        }
    } catch (err) {
        fs.writeFileSync('site_settings_final.json', JSON.stringify({ error: err.message }, null, 2));
    }
}

checkColumns();
