const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables manually
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim().replace(/\"/g, '');
const serviceKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim().replace(/\"/g, '');

const supabase = createClient(url, serviceKey);

async function backup() {
    console.log('--- Starting GroupTutors Data Backup ---');

    const backupData = {
        timestamp: new Date().toISOString(),
        tables: {}
    };

    const tables = ['profiles', 'tutors', 'job_posts', 'admin_activity', 'auth_logs', 'sessions', 'bookings'];

    for (const table of tables) {
        console.log(`Backing up ${table}...`);
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
            console.error(`Error fetching ${table}:`, error);
        } else {
            backupData.tables[table] = data;
            console.log(`Successfully backed up ${data.length} rows from ${table}.`);
        }
    }

    const filename = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(filename, JSON.stringify(backupData, null, 2));

    console.log(`\n--- Backup Complete! ---`);
    console.log(`File saved as: ${filename}`);
    console.log(`IMPORTANT: Keep this file safe. It contains sensitive data.`);
}

backup().catch(console.error);
