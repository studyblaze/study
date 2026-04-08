const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://exkgplqcdtoxfmxqkdpl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a2dwbHFjZHRveGZteHFrZHBsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIxMDQ3NSwiZXhwIjoyMDg3Nzg2NDc1fQ.t7Knpc2zi0qDrjQS09AJHWRDrDrpgzFRd5rmP_KvTzE');
async function run() {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
        console.error('Error listing buckets:', error);
        return;
    }
    const needed = ['tutor-docs', 'intro-videos'];
    const existing = buckets.map(b => b.id);
    const missing = needed.filter(n => !existing.includes(n));
    console.log('Existing buckets:', existing);
    console.log('Missing buckets:', missing);
}
run();
