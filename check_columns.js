const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://exkgplqcdtoxfmxqkdpl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a2dwbHFjZHRveGZteHFrZHBsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIxMDQ3NSwiZXhwIjoyMDg3Nzg2NDc1fQ.t7Knpc2zi0qDrjQS09AJHWRDrDrpgzFRd5rmP_KvTzE');
async function run() {
    const { data, error } = await supabase.from('tutors').select('*').limit(1);
    if (error) {
        console.error('Error:', error);
        return;
    }
    const cols = Object.keys(data[0] || {});
    console.log('price_5 exists:', cols.includes('price_5'));
    console.log('price_10 exists:', cols.includes('price_10'));
    console.log('All columns found:', cols);
}
run();
