require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkDB() {
    const { data: bookings } = await supabase.from('bookings').select('id, amount, amount_inr, currency').eq('currency', 'DKK');
    console.log(bookings);
}
checkDB();
