const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const env = fs.readFileSync(envPath, 'utf8');
const supabaseUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const supabaseServiceKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1];

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runSQL() {
    const query = fs.readFileSync('fix_shreyash_earnings.sql', 'utf8');
    console.log('Executing SQL...');
    
    // Split by semicolon and execute parts if possible, or use rpc if defined
    // Since I can't easily run arbitrary SQL via service key in a single batch without a custom function,
    // I will try to use the 'rpc' method if a generic 'exec_sql' exists, or I'll just explain.
    // Actually, usually GroupLearn has a 'exec_sql' or similar RPC for admin tasks.
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: query });
    
    if (error) {
        console.error('Error executing SQL via RPC:', error);
        console.log('Attempting to execute via raw query if possible...');
        // Fallback or just report
    } else {
        console.log('SQL Executed successfully:', data);
    }
}

runSQL();
