const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://exkgplqcdtoxfmxqkdpl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a2dwbHFjZHRveGZteHFrZHBsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIxMDQ3NSwiZXhwIjoyMDg3Nzg2NDc1fQ.t7Knpc2zi0qDrjQS09AJHWRDrDrpgzFRd5rmP_KvTzE');
async function run() {
    const { data: cols, error } = await supabase.rpc('get_table_columns', { table_name: 'tutors' });
    if (error) {
         const { data, error: error2 } = await supabase.from('tutors').select('*').limit(1);
         if (data && data.length > 0) {
             console.log('Columns:', Object.keys(data[0]));
         } else {
             console.log('No data to check columns');
         }
         return;
    }
    console.log('Columns:', cols.map(c => c.column_name));
}
run();
