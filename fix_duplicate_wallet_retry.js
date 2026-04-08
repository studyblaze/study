require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixDB() {
    const { error: delError } = await supabase
        .from('wallets')
        .delete()
        .eq('id', 11);
        
    fs.writeFileSync('f:/GroupLearn/del_error.json', JSON.stringify({delError}, null, 2));
    console.log("Check del_error.json");
}

fixDB();
