
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://exkgplqcdtoxfmxqkdpl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a2dwbHFjZHRveGZteHFrZHBsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIxMDQ3NSwiZXhwIjoyMDg3Nzg2NDc1fQ.t7Knpc2zi0qDrjQS09AJHWRDrDrpgzFRd5rmP_KvTzE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllColumns() {
    try {
        const { data, error } = await supabase.from('site_settings').select('*').limit(1);
        if (error) {
            fs.writeFileSync('all_db_columns.json', JSON.stringify({ error: error.message }, null, 2));
        } else {
            // Check other potential tables
            const { data: analyticsVisits } = await supabase.from('analytics_visits').select('*').limit(1);
            const { data: seoKeywords } = await supabase.from('seo_keywords').select('*').limit(1);

            const results = {
                site_settings: data && data.length > 0 ? Object.keys(data[0]) : [],
                analytics_visits: analyticsVisits && analyticsVisits.length > 0 ? Object.keys(analyticsVisits[0]) : [],
                seo_keywords: seoKeywords && seoKeywords.length > 0 ? Object.keys(seoKeywords[0]) : [],
            };
            fs.writeFileSync('all_db_columns.json', JSON.stringify(results, null, 2));
        }
    } catch (err) {
        fs.writeFileSync('all_db_columns.json', JSON.stringify({ error: err.message }, null, 2));
    }
}

checkAllColumns();
