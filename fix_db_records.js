require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixDB() {
    const { error } = await supabase
        .from('bookings')
        .update({ amount_inr: 71, amount: 5, tutor_share: 5 })
        .eq('currency', 'DKK')
        .eq('is_demo', true);
        
    console.log("Update Bookings:", error || "Success");

    const { error: error2 } = await supabase
        .from('transactions')
        .update({ amount_inr: 71, amount: 5 })
        .eq('currency', 'DKK')
        .eq('type', 'demo_lesson_payment');

    console.log("Update Transactions:", error2 || "Success");
    
    // Check if there's any financial ledger entries
    const { error: error3 } = await supabase
        .from('financial_ledger')
        .update({ amount_usd: 71 / 83 }) // Approximation for ledger if needed, usually just stored in USD
        .eq('currency', 'DKK');
        
    console.log("Update Ledger:", error3 || "Success");
}
fixDB();
