
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase URL or Anon Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
    try {
        const { data: transactions, error: tErr } = await supabase.from('transactions').select('*').limit(5);
        const { data: bookings, error: bErr } = await supabase.from('bookings').select('*').limit(5);
        const { data: wallets, error: wErr } = await supabase.from('wallets').select('*').limit(5);

        console.log('--- Transactions ---');
        if (tErr) console.error(tErr); else console.log(transactions);

        console.log('--- Bookings ---');
        if (bErr) console.error(bErr); else console.log(bookings);

        console.log('--- Wallets ---');
        if (wErr) console.error(wErr); else console.log(wallets);
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

checkData();
