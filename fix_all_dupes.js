require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixAllDupes() {
    // get all wallets
    const { data: wallets } = await supabase.from('wallets').select('*');
    
    // find dupes
    const userGroups = {};
    for (const w of wallets) {
        if (!userGroups[w.user_id]) userGroups[w.user_id] = [];
        userGroups[w.user_id].push(w);
    }
    
    for (const userId in userGroups) {
        if (userGroups[userId].length > 1) {
            console.log("Found duplicate for user:", userId);
            // Delete the 0 balance one if possible
            const zeroBalance = userGroups[userId].find(w => w.balance === 0);
            if (zeroBalance) {
                console.log("Deleting duplicate row id:", zeroBalance.id);
                await supabase.from('wallets').delete().eq('id', zeroBalance.id);
            }
        }
    }
    
    // Add unique constraint
    const sql = `
        ALTER TABLE public.wallets ADD CONSTRAINT wallets_user_id_key UNIQUE (user_id);
    `;
    const { error: sqlError } = await supabase.rpc('exec_sql', { sql_query: sql });
    console.log("SQL Error:", sqlError);
}

fixAllDupes();
