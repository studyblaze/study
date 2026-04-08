require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRPC() {
    const { data, error } = await supabase.rpc('convert_currency', {
        amount: 100,
        from_currency: 'USD',
        to_currency: 'INR'
    });
    
    fs.writeFileSync('f:/GroupLearn/rpc_inr.json', JSON.stringify({data, error}, null, 2));

    const { data: data2, error: error2 } = await supabase.rpc('convert_currency', {
        amount: 100,
        from_currency: 'USD',
        to_currency: 'DKK'
    });
    
    fs.writeFileSync('f:/GroupLearn/rpc_dkk.json', JSON.stringify({data: data2, error: error2}, null, 2));
    console.log("Done. Check rpc_inr.json and rpc_dkk.json");
}

checkRPC();
