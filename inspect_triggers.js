const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://exkgplqcdtoxfmxqkdpl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a2dwbHFjZHRveGZteHFrZHBsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIxMDQ3NSwiZXhwIjoyMDg3Nzg2NDc1fQ.t7Knpc2zi0qDrjQS09AJHWRDrDrpgzFRd5rmP_KvTzE');
async function run() {
    const { data, error } = await supabase.rpc('get_table_triggers', { table_name: 'tutors' });
    if (error) {
        // Fallback: check triggers via information_schema
        const { data: data2, error: error2 } = await supabase.from('pg_trigger').select('tgname').limit(10);
        console.log('Triggers (raw):', data2 || error2);
        return;
    }
    console.log('Triggers:', data);
}
run();
