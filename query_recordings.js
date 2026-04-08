const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
    'https://exkgplqcdtoxfmxqkdpl.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a2dwbHFjZHRveGZteHFrZHBsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIxMDQ3NSwiZXhwIjoyMDg3Nzg2NDc1fQ.t7Knpc2zi0qDrjQS09AJHWRDrDrpgzFRd5rmP_KvTzE'
);

async function checkRecordings() {
    const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error("Error:", error);
    } else {
        let text = "Recordings:\n";
        data.forEach(r => {
            text += `ID: ${r.id} | Title: ${r.title} | Duration: ${r.duration} | Size: ${r.size_mb} MB | Created: ${r.created_at}\n`;
        });
        fs.writeFileSync('f:/GroupLearn/recordings_log2.txt', text, 'utf8');
        console.log("Wrote to recordings_log2.txt");
    }
}

checkRecordings();
