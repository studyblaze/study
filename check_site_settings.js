
const { createClient } = require('@supabase/supabase-js');

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
            console.error('Error fetching site_settings:', error);
        } else if (data && data.length > 0) {
            console.log('--- SITE SETTINGS DATA ---');
            Object.entries(data[0]).forEach(([key, value]) => {
                console.log(`${key}: ${JSON.stringify(value)}`);
            });
            console.log('--------------------------');
        } else {
            console.log('No data found in site_settings');
        }
    } catch (err) {
        console.error('Script error:', err);
    }
}

checkColumns();
