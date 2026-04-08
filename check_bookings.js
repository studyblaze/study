require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkDB() {
    const { data: bookings } = await supabase.from('bookings').select('*');
    if (bookings) {
        fs.writeFileSync('f:/GroupLearn/all_bookings.json', JSON.stringify(bookings, null, 2));
    }
}
checkDB();
