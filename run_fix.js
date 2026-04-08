const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
    "https://exkgplqcdtoxfmxqkdpl.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a2dwbHFjZHRveGZteHFrZHBsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjI3MjEyNiwiZXhwIjoyMDU3ODQ4MTI2fQ.H_Q0E_iKly-y0qIdz2M6D-v6lA9H2-x-5E9S_k-X-k8"
);

async function runFix() {
    try {
        console.log("Applying RLS and balance fixes...");
        if (!fs.existsSync('fix_financial_admin_access.sql')) {
            console.error("SQL file not found!");
            process.exit(1);
        }
        const sql = fs.readFileSync('fix_financial_admin_access.sql', 'utf8');
        
        console.log("Executing RPC...");
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
        
        if (error) {
            console.error("Error executing SQL via RPC:", error);
            process.exit(1);
        } else {
            console.log("SQL executed successfully!");
            process.exit(0);
        }
    } catch (err) {
        console.error("Unexpected error:", err);
        process.exit(1);
    }
}

runFix();
