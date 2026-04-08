require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDB() {
    const { data: bookings } = await supabase.from('bookings').select('*');
    if (bookings) {
        console.log("Bookings:", bookings.slice(0, 3));
    }
    
    const { data: transactions } = await supabase.from('transactions').select('*');
    if (transactions) {
        console.log("Transactions:", transactions.filter(t => t.amount_inr === 143.3 || t.amount === 143.3));
    }
    
    const { data: ledger } = await supabase.from('financial_ledger').select('*');
    if (ledger) {
        console.log("Ledger:", ledger.filter(l => l.amount_inr === 143.3 || l.amount === 143.3));
    }
}
checkDB();
