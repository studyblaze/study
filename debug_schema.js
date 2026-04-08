
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
    console.log('Inspecting schema...');

    // We can't directly inspect schema with JS client easily without RPC or raw SQL
    // But we can try to fetch one row and see the keys
    const tables = ['sessions', 'bookings', 'subscriptions', 'subscription_usage', 'profiles', 'tutors'];

    const schema = {};
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.error(`Error fetching ${table}:`, error.message);
            schema[table] = { error: error.message };
        } else if (data && data.length > 0) {
            schema[table] = Object.keys(data[0]);
        } else {
            schema[table] = 'No data found';
        }
    }

    fs.writeFileSync('current_schema_inspection.json', JSON.stringify(schema, null, 2));
    console.log('Schema saved to current_schema_inspection.json');
}

inspectSchema();
