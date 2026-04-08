require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function listTables() {
    const { data, error } = await supabase.rpc('get_tables'); // Hope there's an RPC or I can just select from a known table
    if (error) {
        // Fallback: try to select from information_schema if possible via query
        const { data: tables, error: tableError } = await supabase
            .from('pg_tables') // Usually not readable by service role unless specifically allowed
            .select('tablename')
            .eq('schemaname', 'public');
        
        if (tableError) {
            console.log("Could not list tables:", tableError);
            // Try common tables
            const common = ['subscriptions', 'lessons', 'student_profiles', 'wallets', 'bookings'];
            for(const t of common) {
                const { data: cols } = await supabase.from(t).select('*').limit(1);
                if (cols) console.log(`Table exists: ${t}`);
            }
        } else {
            console.log(tables);
        }
    } else {
        console.log(data);
    }
}
listTables();
