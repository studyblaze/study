require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixDB() {
    const userId = '54fb63ef-cc85-4c65-8d02-0787497a381d'; // Shreyash ID
    
    // Delete the 0 balance row
    const { error: delError } = await supabase
        .from('wallets')
        .delete()
        .eq('user_id', userId)
        .eq('balance', 0);
        
    if (delError) {
        console.error("Delete Error:", delError);
    } else {
        console.log("Successfully deleted duplicate 0-balance wallet row.");
    }

    // Add unique constraint
    const sql = `
        ALTER TABLE public.wallets ADD CONSTRAINT wallets_user_id_key UNIQUE (user_id);
    `;
    const { error: sqlError } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (sqlError) {
        console.log("Note: Could not add unique constraint via RPC (may not exist). Run manually if needed.");
    } else {
        console.log("Successfully added unique constraint on wallets.user_id");
    }
}

fixDB();
