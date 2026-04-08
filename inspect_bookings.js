const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://exkgplqcdtoxfmxqkdpl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a2dwbHFjZHRveGZteHFrZHBsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIxMDQ3NSwiZXhwIjoyMDg3Nzg2NDc1fQ.t7Knpc2zi0qDrjQS09AJHWRDrDrpgzFRd5rmP_KvTzE');
async function run() {
    const { data, error } = await supabase.from('bookings').select('*').limit(1);
    if (error) {
        console.error(error);
        return;
    }
    if (data.length > 0) {
        console.log(Object.keys(data[0]));
    } else {
        console.log('No data found in bookings');
        // Let's try to get columns via a different way if empty
        const { data: cols, error: colError } = await supabase.rpc('get_table_columns', { table_name: 'bookings' });
        console.log(cols || colError);
    }
}
run();
